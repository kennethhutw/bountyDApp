pragma solidity ^0.5.0 ;

/// @title Bounty management
/// @author Kenneth Hu
/// @notice You can use this contract to manage bounty.
/// @dev All function calls are currently implemented without side effects
contract BountyPost{
    struct Bounty {
        uint id;
        string title;
        string description;
        string attachment;
        uint payment;
        address payable owner;
        address payable[] applicants;
        address arbitrator;
        address payable worker ;
        bool workCompleted; // Indicates if the work has been marked as complete
        bool isCompleted; // Indicates if the bounty has been marked as complete
    }

    uint totalBounties = 0;
    mapping (uint => Bounty) allBounties;
    address[] public posterAccounts;

    /// @notice Add a bounty to list of all bounties
    /// @param title the title of bounty
    /// @param desc the description of bounty
    /// @param desc the value of ipfs hash of bounty
    /// @param pay the amount of bounty
    function addBounty(string memory title, string memory desc, string memory attachment, uint pay) public payable {
        Bounty storage bounty = allBounties[totalBounties];
        require(pay == msg.value,"value does not equal to pay");

        bounty.id = totalBounties;
        bounty.title = title;
        bounty.description = desc;
        bounty.payment = msg.value;
        bounty.owner = msg.sender;
        bounty.attachment = attachment;
        bounty.applicants;
        bounty.worker;
        bounty.workCompleted = false;
        bounty.isCompleted = false;

        totalBounties += 1;

        posterAccounts.push(msg.sender);

    }

    /// @notice allows the owner to assign an arbitrator
    /// @param bountyId the id of bounty
    /// @param arbitrator the arbitrator's address
    function setArbitrator(uint bountyId, address arbitrator) public {
        Bounty storage bounty = allBounties[bountyId];
        if (bounty.owner == msg.sender) {
            if (bounty.owner != arbitrator) {
                if(bounty.worker != arbitrator){
                bounty.arbitrator = arbitrator;
                }
            }
        }
    }

    /// @notice get arbitrator of a bounty by the index of bounty
    /// @param bountyId the index of bounty
    /// @return arbitrator of a bounty
    function getArbitrator(uint bountyId) public view returns (address) {
        Bounty storage bounty = allBounties[bountyId];
        return bounty.arbitrator;
    }

    /// @notice get a bounty by index
    /// @param i the index of bounty
    /// @return the details of bounty
    function getBounty(uint i) public view returns(uint ,
    string memory,
     string memory,
    string memory, uint, address) {
        return (allBounties[i].id,
         allBounties[i].title,
         allBounties[i].description,
         allBounties[i].attachment,
         allBounties[i].payment,
         allBounties[i].owner);
    }

    /// @notice get the bounty count
    /// @return the bounty count
    function getBountyCount() public view returns (uint){
        return totalBounties;
    }

    /// @notice Adds a non owner account as an applicant
    /// @param i the index of bounty
    function applyToBounty(uint i) public {
        Bounty storage bounty = allBounties[i];
        if (bounty.owner != msg.sender) {
            bounty.applicants.push(msg.sender);
        }
    }

    /// @notice get the list of applicantst by the index of bounty
    /// @param i the index of bounty
    /// @return the list of applicants
    function getApplicants(uint i) public view returns(address payable[] memory ){
        return allBounties[i].applicants;
    }

    /// @notice allows the owner to assign a worker
    /// @param bountyId the id of bounty
    /// @param candidate the address of candidate
    function setWorker(uint bountyId, address payable candidate) public {
        Bounty storage bounty = allBounties[bountyId];
        if (bounty.owner == msg.sender) {
            bounty.worker = candidate;
        }
    }

    /// @notice get worker of a bounty by the index of bounty
    /// @param bountyId the index of bounty
    /// @return worker of a bounty
    function getWorker(uint bountyId) public view returns (address) {
        Bounty storage bounty = allBounties[bountyId];
        return bounty.worker;
    }

    /// @notice get owner of a bounty by the index of bounty
    /// @param bountyId the index of bounty
    /// @return owner of a bounty
    function getOwner(uint bountyId) public view returns (address) {
        Bounty storage bounty = allBounties[bountyId];
        return bounty.owner;
    }

    /// @notice allows the worker to complete the bounty
    /// @param bountyId the index of bounty
    function completeWork(uint bountyId) public  {
        Bounty storage bounty = allBounties[bountyId];
        if (bounty.worker == msg.sender) {
          bounty.workCompleted = true;
        }
    }

    /// @notice Returns if the worker has marked the bounty as complete
    /// @param bountyId the index of bounty
    /// @return the status of a bounty
    function isWorkComplete(uint bountyId) public view returns (bool){
        Bounty storage bounty = allBounties[bountyId];
        return bounty.workCompleted;
    }

    /// @notice allows the owner to complete the bounty and make payment
    /// @param bountyId the index of bounty
    function completeBounty(uint bountyId) public {
        Bounty storage bounty = allBounties[bountyId];
        if (bounty.owner == msg.sender || bounty.arbitrator == msg.sender) {
         bounty.worker.transfer(bounty.payment);
          bounty.isCompleted = true;
        }
    }

    /// @notice Returns if the bounty is completed
    /// @param bountyId the index of bounty
    /// @return the status of a bounty
    function isComplete(uint bountyId) public view returns (bool){
         Bounty storage bounty = allBounties[bountyId];
        return bounty.isCompleted;
    }

    /// @notice allows the owner to cancel the bounty
    /// @param bountyId the index of bounty
    function cancelBounty(uint bountyId) public {
        Bounty storage bounty = allBounties[bountyId];
        if (bounty.owner == msg.sender || bounty.arbitrator == msg.sender) {
          bounty.isCompleted = true;
          bounty.owner.transfer(bounty.payment);
        }
    }
}
