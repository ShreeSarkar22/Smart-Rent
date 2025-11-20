// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RentAgreement {
    struct Agreement {
        address payable landlord;
        address tenant;
        string ipfsHash; // PDF Agreement
        uint256 duration; // Total duration in seconds
        uint256 interval; // Payment interval in seconds
        uint256 rentPerInterval; // Amount in Wei
        uint256 startTime;
        uint256 totalRentPaid;
        bool active;
        bool fullyPaidByTenant;
    }

    Agreement public agreement;

    event AgreementCreated(address landlord, address tenant);
    event RentPaid(address tenant, uint256 amount);
    event RentReleased(address landlord, uint256 amount);
    event AgreementEnded();

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

    // Tenant pays the full amount upfront
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

    // Can be called by anyone to release funds if due
    function releaseRent() external {
        require(agreement.active, "Agreement not active");
        require(agreement.fullyPaidByTenant, "Tenant has not paid yet");
        require(block.timestamp < agreement.startTime + agreement.duration + agreement.interval, "Duration Over");

        // Calculate how many intervals have passed since start
        uint256 timeElapsed = block.timestamp - agreement.startTime;
        uint256 intervalsPassed = timeElapsed / agreement.interval;
        
        // Calculate how much should have been paid by now
        uint256 amountDue = intervalsPassed * agreement.rentPerInterval;
        
        // Calculate how much is remaining to be paid to landlord
        uint256 amountToRelease = amountDue - agreement.totalRentPaid;

        require(amountToRelease > 0, "No rent due yet");
        require(address(this).balance >= amountToRelease, "Insufficient contract balance");

        agreement.totalRentPaid += amountToRelease;
        agreement.landlord.transfer(amountToRelease);

        emit RentReleased(agreement.landlord, amountToRelease);
    }

    function isDurationOver() external view returns (bool) {
        if (agreement.startTime == 0) return false;
        return block.timestamp >= agreement.startTime + agreement.duration;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}