pragma solidity ^0.5.0;

/// @title A simulator for trees
/// @author Kenneth Hu
/// @notice You can use this contract to manage users.
/// @dev All function calls are currently implemented without side effects
contract Accounts {
    struct Account {
        bytes16 firstName;
        bytes16 lastName;
        string biography;
        string email;
        uint256[] employerJobs; // All jobs a user has created
        uint256[] workerJobs; // All jobs a user has been assigned to
        address addr;
    }

    mapping(address => Account) accounts; // Map contract address to account
    address[] public allAccounts;

    /// @notice Create an account
    /// @param _addr the ethereum wallet address of account
    /// @param _firstName the fast name of account
    /// @param _lastName the last name of account
    /// @param _biography a detailed description of an account.
    /// @param _email account's email address
    function setAccount(
        address _addr,
        bytes16 _firstName,
        bytes16 _lastName,
        string memory _biography,
        string memory _email
    ) public {
        Account storage account = accounts[_addr];

        account.firstName = _firstName;
        account.lastName = _lastName;
        account.biography = _biography;
        account.email = _email;
        account.employerJobs;
        account.workerJobs;
        account.addr = _addr;
        allAccounts.push(_addr);
    }

    /// @notice Get a list of all accounts
    /// @return a list of all accounts
    function getAccounts() public view returns (address[] memory) {
        return allAccounts;
    }

    /// @notice Get a single account
    /// @param _addr the ethereum wallet address of account
    /// @return the detial of a single account
    function getAccount(address _addr)
        public
        view
        returns (
            bytes16,
            bytes16,
            uint256[] memory,
            uint256[] memory,
            address,
            string memory,
            string memory
        )
    {
        return (
            accounts[_addr].firstName,
            accounts[_addr].lastName,
            accounts[_addr].employerJobs,
            accounts[_addr].workerJobs,
            accounts[_addr].addr,
            accounts[_addr].biography,
            accounts[_addr].email
        );
    }

    /// @notice Add a job to an accounts employerJobs list
    /// @param _addr the ethereum wallet address of account
    /// @param id the ethereum wallet address of account
    function addEmployerJob(address _addr, uint256 id) public {
        Account storage acc = accounts[_addr];
        if (acc.addr == msg.sender) {
            acc.employerJobs.push(id);
        }
    }

    /// @notice Add a job to an accounts workerJobs list
    /// @param _addr the ethereum wallet address of account
    /// @param id the ethereum wallet address of account
    function addWorkerJob(address _addr, uint256 id) public {
        Account storage acc = accounts[_addr];
        acc.workerJobs.push(id);
    }

    /// @notice get all of an accounts employerJobs
    /// @param _addr the ethereum wallet address of account
    /// @return all of an accounts employerJobs
    function getEmployerJobs(address _addr)
        public
        view
        returns (uint256[] memory)
    {
        return accounts[_addr].employerJobs;
    }

    /// @notice get all of an accounts workerJobs
    /// @param _addr the ethereum wallet address of account
    /// @return all of an accounts workerJobs
    function getWorkerJobs(address _addr)
        public
        view
        returns (uint256[] memory)
    {
        return accounts[_addr].workerJobs;
    }

    /// @notice get the total number of accounts
    /// @return the total number of accounts
    function countAccounts() public view returns (uint256) {
        return allAccounts.length;
    }
}
