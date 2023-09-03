// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

contract SocialX {
    uint256 POST_ID; // Counter for generating unique post IDs

    struct UserProfile {
        address userAddress; // Address of the user
        string userProfileCID; // Content ID for username, bio, and profile picture
    }

    struct Post {
        uint256 postId; // Unique ID of the post
        address postOwner; // Address of the user who created the post
        uint256 postTimestamp; // Timestamp when the post was created
        string postCID; // Content ID for post description and image
    }

    struct Comment {
        address commentOwner; // Address of the user who made the comment
        uint256 commentTimestamp; // Timestamp when the comment was made
        string commentCID; // Content ID for the comment data
    }

    Post[] public allPosts; // Array to store all posts
    UserProfile[] public allProfiles; // Array to store all posts

    mapping(address => UserProfile) Profiles;
    mapping(address => bool) isProfileCreated;
    mapping(address => uint256) userFollowerCount;
    mapping(address => uint256) userFollowingCount;
    mapping(address => UserProfile[]) userFollowerProfiles;
    mapping(address => UserProfile[]) userFollowingProfiles;
    mapping(address => mapping(address => bool)) isUserFollowing;
    mapping(address => Post[]) userPosts;
    mapping(address => Post[]) userSavedPosts;
    mapping(uint256 => Post) idToPost;
    mapping(uint256 => uint256) postLikes;
    mapping(address => mapping(uint256 => bool)) hasUserLikedPost;
    mapping(uint256 => Comment[]) postComments;

    // Function to create a user profile
    function createUserProfile(string memory _userProfileCID) public {
        UserProfile memory userProfile = UserProfile(
            msg.sender,
            _userProfileCID
        );
        Profiles[msg.sender] = userProfile;
        allProfiles.push(userProfile);
        isProfileCreated[msg.sender] = true;
    }

    // Function to follow a user
    function followUser(address _userAddress) public {
        require(isProfileCreated[_userAddress] && isProfileCreated[msg.sender]);
        userFollowerCount[_userAddress]++;
        userFollowingCount[msg.sender]++;
        userFollowerProfiles[_userAddress].push(Profiles[msg.sender]);
        userFollowingProfiles[msg.sender].push(Profiles[_userAddress]);
        isUserFollowing[msg.sender][_userAddress] = true;
    }

    // Function to unfollow a user
    function unfollowUser(address _userAddress) public {
        require(isUserFollowing[msg.sender][_userAddress]);
        userFollowerCount[_userAddress]--;
        userFollowingCount[msg.sender]--;

        removeProfile(userFollowerProfiles[_userAddress], msg.sender);
        removeProfile(userFollowingProfiles[msg.sender], _userAddress);

        isUserFollowing[msg.sender][_userAddress] = false;
    }

    // Internal function to remove a profile from an array
    function removeProfile(
        UserProfile[] storage profiles,
        address profileAddress
    ) internal {
        for (uint256 i = 0; i < profiles.length; i++) {
            if (profiles[i].userAddress == profileAddress) {
                profiles[i] = profiles[profiles.length - 1];
                profiles.pop();
                return;
            }
        }
    }

    // Function to create a post
    function createPost(string memory _postCID) public {
        require(isProfileCreated[msg.sender]);
        POST_ID++;
        Post memory post = Post(POST_ID, msg.sender, block.timestamp, _postCID);
        allPosts.push(post);
        idToPost[POST_ID] = post;
        userPosts[msg.sender].push(post);
    }

    // Function to save a post
    function savePost(uint256 _postId) public {
        userSavedPosts[msg.sender].push(idToPost[_postId]);
    }

    // Function to delete a saved post
    function deleteSavedPost(uint256 _postId) public {
        Post storage savedPost = idToPost[_postId];
        require(savedPost.postOwner != address(0), "Post does not exist");

        Post[] storage savedPosts = userSavedPosts[msg.sender];
        uint256 savedPostIndex = findSavedPostIndex(savedPosts, _postId);
        require(savedPostIndex < savedPosts.length, "Saved post not found");

        savedPosts[savedPostIndex] = savedPosts[savedPosts.length - 1];
        savedPosts.pop();
    }

    // Function to find the index of a saved post
    function findSavedPostIndex(
        Post[] storage savedPosts,
        uint256 _postId
    ) internal view returns (uint256) {
        for (uint256 i = 0; i < savedPosts.length; i++) {
            if (savedPosts[i].postId == _postId) {
                return i;
            }
        }
        return savedPosts.length; // Indicate saved post not found
    }

    // Function to delete a user's own post
    function deletePost(uint256 _postId) public {
        require(
            idToPost[_postId].postOwner == msg.sender,
            "You can only delete your own posts"
        );

        Post memory postToDelete = idToPost[_postId];
        require(postToDelete.postId != 0, "Post does not exist");

        uint256 postIndex = findPostIndex(_postId);
        require(postIndex < allPosts.length, "Post not found");

        allPosts[postIndex] = allPosts[allPosts.length - 1];
        allPosts.pop();

        delete idToPost[_postId];

        Post[] storage userPostList = userPosts[msg.sender];
        uint256 userPostIndex = findUserPostIndex(userPostList, _postId);
        if (userPostIndex < userPostList.length) {
            userPostList[userPostIndex] = userPostList[userPostList.length - 1];
            userPostList.pop();
        }
    }

    // Function to find the index of a post
    function findPostIndex(uint256 _postId) internal view returns (uint256) {
        for (uint256 i = 0; i < allPosts.length; i++) {
            if (allPosts[i].postId == _postId) {
                return i;
            }
        }
        return allPosts.length; // Indicate post not found
    }

    // Function to find the index of a user's post
    function findUserPostIndex(
        Post[] storage userPostList,
        uint256 _postId
    ) internal view returns (uint256) {
        for (uint256 i = 0; i < userPostList.length; i++) {
            if (userPostList[i].postId == _postId) {
                return i;
            }
        }
        return userPostList.length; // Indicate post not found
    }

    // Function to like a post
    function likePost(uint256 _postId) public {
        require(!hasUserLikedPost[msg.sender][_postId]);
        postLikes[_postId]++;
        hasUserLikedPost[msg.sender][_postId] = true;
    }

    // Function to dislike a post
    function dislikePost(uint256 _postId) public {
        require(hasUserLikedPost[msg.sender][_postId]);
        postLikes[_postId]--;
        hasUserLikedPost[msg.sender][_postId] = false;
    }

    // Function to comment on a post
    function commentOnPost(uint256 _postId, string memory _commentCID) public {
        Comment memory comment = Comment(
            msg.sender,
            block.timestamp,
            _commentCID
        );
        postComments[_postId].push(comment);
    }

    // Function to get user followers
    function getUserFollowers(
        address _userAddress
    ) public view returns (UserProfile[] memory) {
        return userFollowerProfiles[_userAddress];
    }

    // Function to get user followings
    function getUserFollowings(
        address _userAddress
    ) public view returns (UserProfile[] memory) {
        return userFollowingProfiles[_userAddress];
    }

    function getAllProfiles() public view returns (UserProfile[] memory) {
        return allProfiles;
    }

    // Function to get user profile
    function getUserProfile(
        address _userAddress
    ) public view returns (UserProfile memory) {
        return Profiles[_userAddress];
    }

    // Function to check if a profile has been created
    function getIsProfileCreated(
        address _userAddress
    ) public view returns (bool) {
        return isProfileCreated[_userAddress];
    }

    // Function to get all posts
    function getAllPosts() public view returns (Post[] memory) {
        return allPosts;
    }

    // Function to get user's own posts
    function getUserPosts() public view returns (Post[] memory) {
        return userPosts[msg.sender];
    }

    // Function to get user's saved posts
    function getUserSavedPosts() public view returns (Post[] memory) {
        return userSavedPosts[msg.sender];
    }

    function getPost(uint256 _postId) public view returns (Post memory) {
        return idToPost[_postId];
    }

    function getPostCID(uint256 _postId) public view returns (string memory) {
        return idToPost[_postId].postCID;
    }

    function UserLikedPost(uint256 _postId) public view returns (bool) {
        return hasUserLikedPost[msg.sender][_postId];
    }

    function getLikesNumber(uint256 _postId) public view returns (uint256) {
        return postLikes[_postId];
    }

    function getCommentsNumber(uint256 _postId) public view returns (uint256) {
        return postComments[_postId].length;
    }

    function getPostComments(
        uint256 _postId
    ) public view returns (Comment[] memory) {
        return postComments[_postId];
    }

    function getIsUserFollowing(address _user) public view returns (bool) {
        return isUserFollowing[msg.sender][_user];
    }
}
