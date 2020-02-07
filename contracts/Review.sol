pragma solidity ^0.5.0;

/// @title Review management
/// @author Kenneth Hu
/// @notice Owner and worker can leave comment to each other
/// @dev All function calls are currently implemented without side e
contract Reviews {
    struct Review {
        address reviewee;
        uint256 bountyID;
        string reviewText;
        uint256 stars;
        uint256 reviewID;
        address reviewer;
    }

    uint256 reviewCounter = 0;
    mapping(uint256 => Review) reviews;
    mapping(uint256 => uint256[]) bountyReviews; // Mapping of reviews to a specific bounty
    mapping(address => uint256[]) reviewsSent; // Mapping of reviews sent by specific user
    mapping(address => uint256[]) reviewsReceived; // Mapping of reviews recieved by specific user
    uint256[] public allReviews;

    /// @notice post an account
    /// @param _reviewee A reviewee is the person who is being reviewed.
    /// @param _bountyID the ID of bounty
    /// @param _reviewText the content of review
    /// @param _stars stars are often used as symbols for ratings, with five stars being the highest quality.
    function postReview(
        address _reviewee,
        uint256 _bountyID,
        string memory _reviewText,
        uint256 _stars
    ) public {
        Review storage review = reviews[reviewCounter];

        review.reviewee = _reviewee;
        review.bountyID = _bountyID;
        review.reviewText = _reviewText;
        review.stars = _stars;
        review.reviewID = reviewCounter;
        review.reviewer = msg.sender;

        allReviews.push(review.reviewID);
        bountyReviews[review.bountyID].push(review.reviewID);
        reviewsSent[msg.sender].push(review.reviewID);
        reviewsReceived[review.reviewee].push(review.reviewID);

        reviewCounter += 1;
    }

    /// @notice get review by the index of review
    /// @param reviewID the index of review
    /// @return Returns a review
    function getReview(uint256 reviewID)
        public
        view
        returns (address, uint256, string memory, uint256, uint256, address)
    {
        return (
            reviews[reviewID].reviewee,
            reviews[reviewID].bountyID,
            reviews[reviewID].reviewText,
            reviews[reviewID].stars,
            reviews[reviewID].reviewID,
            reviews[reviewID].reviewer
        );
    }

    /// @notice get the reviews recieved by a user
    /// @param addr user's address
    /// @return Returns the reviews
    function getReceivedReviews(address addr)
        public
        view
        returns (uint256[] memory)
    {
        return reviewsReceived[addr];
    }

    /// @notice get the reviews sent by a user
    /// @param addr user's address
    /// @return Returns the reviews
    function getSentReviews(address addr)
        public
        view
        returns (uint256[] memory)
    {
        return reviewsSent[addr];
    }

    /// @notice get reviews related to a bounty
    /// @param bountyID user's address
    /// @return reviews related to a bounty
    function getBountyReviews(uint256 bountyID)
        public
        view
        returns (uint256[] memory)
    {
        return bountyReviews[bountyID];
    }

    /// @notice get the total number of review
    /// @return he total number of review
    function getReviewCount() public view returns (uint256) {
        return reviewCounter;
    }
}
