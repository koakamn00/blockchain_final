// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRewardToken {
    function mint(address to, uint256 amount) external;
    function balanceOf(address user) external view returns (uint256);
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
        bool finalized;
        bool successful;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    uint256 public campaignCount;

    event CampaignCreated(uint256 id, string title, address creator);
    event ContributionMade(uint256 id, address contributor, uint256 amount);
    event CampaignFinalized(uint256 id, bool successful);
    event RefundClaimed(uint256 id, address contributor, uint256 amount);

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
            finalized: false,
            successful: false
        });

        emit CampaignCreated(campaignCount, _title, msg.sender);
        campaignCount++;
    }

    function contribute(uint256 _id) external payable {
        require(_id < campaignCount, "Invalid campaign");
        Campaign storage c = campaigns[_id];

        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Zero contribution");

        c.totalRaised += msg.value;
        contributions[_id][msg.sender] += msg.value;

        rewardToken.mint(msg.sender, msg.value * 100);

        emit ContributionMade(_id, msg.sender, msg.value);
    }

    function finalize(uint256 _id) external {
        require(_id < campaignCount, "Invalid campaign");
        Campaign storage c = campaigns[_id];

        require(block.timestamp >= c.deadline, "Too early");
        require(!c.finalized, "Already finalized");
        require(
            msg.sender == c.creator || msg.sender == owner,
            "Not authorized"
        );

        c.finalized = true;

        if (c.totalRaised >= c.goal) {
            c.successful = true;

            uint256 fee = (c.totalRaised * PLATFORM_FEE) / 100;
            uint256 creatorAmount = c.totalRaised - fee;

            c.creator.transfer(creatorAmount);
            payable(owner).transfer(fee);
        }

        emit CampaignFinalized(_id, c.successful);
    }

    function refund(uint256 _id) external {
        Campaign storage c = campaigns[_id];

        require(c.finalized, "Not finalized");
        require(!c.successful, "Campaign successful");

        uint256 amount = contributions[_id][msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[_id][msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit RefundClaimed(_id, msg.sender, amount);
    }

    struct Vote {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool active;
    }

    mapping(uint256 => Vote) public votes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    function createVote(uint256 _campaignId, string memory _desc) external {
        Campaign storage c = campaigns[_campaignId];

        require(c.successful, "Campaign not successful");
        require(msg.sender == c.creator, "Only creator");

        votes[_campaignId] = Vote({
            description: _desc,
            votesFor: 0,
            votesAgainst: 0,
            active: true
        });
    }

    function vote(uint256 _campaignId, bool support) external {
        Vote storage v = votes[_campaignId];
        require(v.active, "Voting closed");
        require(!hasVoted[_campaignId][msg.sender], "Already voted");

        uint256 weight = rewardToken.balanceOf(msg.sender);
        require(weight > 0, "No participation tokens");

        if (support) {
            v.votesFor += weight;
        } else {
            v.votesAgainst += weight;
        }

        hasVoted[_campaignId][msg.sender] = true;
    }

    function closeVote(uint256 _campaignId) external {
        Campaign storage c = campaigns[_campaignId];
        require(msg.sender == c.creator, "Only creator");

        votes[_campaignId].active = false;
    }
}
