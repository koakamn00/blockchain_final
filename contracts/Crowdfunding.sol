//SPDX-License-Identifier:MIT
pragma solidity ^0.8.20;

interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

contract Crowdfunding {
    address public owner;
    uint256 public constant PLATFORM_FEE = 10;
    IRewardToken public rewardToken;

    constructor(address _token) {
        owner = msg.sender;
        rewardToken = IRewardToken(_token);
    }

    struct Campaign {
        string title;
        address payable creator;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        bool finished;
    }
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public campaignCount;

    event CampaignCreated(uint256 id, string title, address creator);
    event ContributionMade(uint256 id, address contributor, uint256 amount);
    event CampaignFinalized(uint256 id);

    function createCampaign(
        string memory _title,
        uint256 _goal,
        uint256 _duration
    ) external {
        campaigns[campaignCount] = Campaign({
            title: _title,
            creator: payable(msg.sender),
            goal: _goal,
            deadline: block.timestamp + _duration,
            totalRaised: 0,
            finished: false
        });
        emit CampaignCreated(campaignCount, _title, msg.sender);
        campaignCount++;
    }

    function contribute(uint256 _id) external payable {
        require(_id < campaignCount, "Invalid campaign id");

        Campaign storage c = campaigns[_id];
        require(!c.finished, "Campaign Finished");
        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Zero contribution");

        uint256 fee = (msg.value * PLATFORM_FEE) / 100;
        uint256 creatorAmount = msg.value - fee;

        c.creator.transfer(creatorAmount);
        payable(owner).transfer(fee);

        c.totalRaised += msg.value;
        contributions[_id][msg.sender] += msg.value;

        rewardToken.mint(msg.sender, msg.value * 100);
        emit ContributionMade(_id, msg.sender, msg.value);
    }

    function finalize(uint256 _id) external {
        require(_id < campaignCount, "Invalid campaign id");

        Campaign storage c = campaigns[_id];
        require(block.timestamp >= c.deadline, "Too early");
        require(!c.finished, "Already finished");
        require(
            msg.sender == c.creator || msg.sender == owner,
            "Not authorized"
        );

        c.finished = true;
        emit CampaignFinalized(_id);
    }
}
