// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentAgreement {
    struct Agreement {
        address payable landlord;
        address tenant;
        string ipfsHash;
        uint256 duration;
        uint256 interval;
        uint256 rentPerInterval;
        uint256 startTime;
        uint256 totalRentPaid;
        bool active;
        bool fullyPaidByTenant;
    }

    Agreement public agreement;

    event AgreementCreated(address landlord, address tenant);
    event RentPaid(address tenant, uint256 amount);
    event RentReleased(address landlord, uint256 amount);
    event AgreementReset();

    constructor() {}

    function createAgreement(
        address _tenant, 
        uint256 _duration, 
        uint256 _interval, 
        uint256 _rentPerInterval, 
        string memory _ipfsHash
    ) external {
        require(agreement.landlord == address(0), "Agreement already exists");
        
        agreement = Agreement({
            landlord: payable(msg.sender),
            tenant: _tenant,
            ipfsHash: _ipfsHash,
            duration: _duration,
            interval: _interval,
            rentPerInterval: _rentPerInterval,
            startTime: 0,
            totalRentPaid: 0,
            active: true,
            fullyPaidByTenant: false
        });

        emit AgreementCreated(msg.sender, _tenant);
    }

    function fundAgreement() external payable {
        require(msg.sender == agreement.tenant, "Only tenant can fund");
        require(!agreement.fullyPaidByTenant, "Already funded");
        
        uint256 totalIntervals = agreement.duration / agreement.interval;
        uint256 totalRequired = totalIntervals * agreement.rentPerInterval;

        require(msg.value == totalRequired, "Incorrect full rent amount");

        agreement.startTime = block.timestamp;
        agreement.fullyPaidByTenant = true;

        emit RentPaid(msg.sender, msg.value);
    }

    function releaseRent() external {
        require(agreement.active, "Agreement not active");
        require(agreement.fullyPaidByTenant, "Tenant has not paid yet");

        uint256 totalContractValue = (agreement.duration / agreement.interval) * agreement.rentPerInterval;
        uint256 amountDue;

        // FIX: If duration is over, the AMOUNT DUE is the TOTAL CONTRACT VALUE.
        if (block.timestamp >= agreement.startTime + agreement.duration) {
            amountDue = totalContractValue;
        } else {
            // Normal calculation
            uint256 timeElapsed = block.timestamp - agreement.startTime;
            uint256 intervalsPassed = timeElapsed / agreement.interval;
            amountDue = intervalsPassed * agreement.rentPerInterval;
        }

        uint256 amountToRelease = amountDue - agreement.totalRentPaid;

        require(amountToRelease > 0, "No rent due yet or already fully paid");
        require(address(this).balance >= amountToRelease, "Insufficient contract balance");

        agreement.totalRentPaid += amountToRelease;
        agreement.landlord.transfer(amountToRelease);

        emit RentReleased(agreement.landlord, amountToRelease);
    }

    function isDurationOver() external view returns (bool) {
        if (agreement.startTime == 0) return false;
        return block.timestamp >= agreement.startTime + agreement.duration;
    }
    
    function resetAgreement() external {
        require(msg.sender == agreement.landlord, "Only Landlord");
        require(block.timestamp >= agreement.startTime + agreement.duration, "Duration not over yet");
        
        // Safety: Ensure landlord gets everything before deleting
        if (address(this).balance > 0) {
            payable(msg.sender).transfer(address(this).balance);
        }

        delete agreement;
        emit AgreementReset();
    }
}