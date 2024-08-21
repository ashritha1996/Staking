// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StakingPlatform {
    struct Stake {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => Stake) public stakes;
    mapping(address => uint256) public rewards;
    uint256 public rewardRate = 100; // Reward rate in basis points (1%)
    address public owner;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor() payable{
        require(msg.value > 0, "Initial funding required");
        owner = msg.sender;
    }

    function stake() external payable {
        require(msg.value > 0, "Cannot stake 0");

        Stake storage userStake = stakes[msg.sender];
        
        // Calculate and update pending rewards before staking more
        if (userStake.amount > 0) {
            rewards[msg.sender] += calculateReward(msg.sender);
        }

        userStake.amount += msg.value;
        userStake.startTime = block.timestamp;

        emit Staked(msg.sender, msg.value);
    }

    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No staked amount");

        uint256 reward = calculateReward(msg.sender);
        uint256 amountToTransfer = userStake.amount + reward;

        require(address(this).balance >= amountToTransfer, "Insufficient contract balance");

        // Reset user staking data before transferring funds
        userStake.amount = 0;
        userStake.startTime = 0;
        rewards[msg.sender] = 0;

        // Perform the transfer using `call`
        (bool success, ) = msg.sender.call{value: amountToTransfer}("");
        require(success, "Transfer failed");

        emit Unstaked(msg.sender, amountToTransfer - reward, reward);
    }

    function calculateReward(address staker) public view returns (uint256) {
        Stake storage userStake = stakes[staker];
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        uint256 reward = (userStake.amount * rewardRate * stakingDuration) / (365 days * 10000);
        return reward + rewards[staker];
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getStakingDetails(address staker) external view returns (uint256, uint256) {
        return (stakes[staker].amount, calculateReward(staker));
    }
}
