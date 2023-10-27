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
    mapping(address => mapping(uint256 => bool)) isPostSaved;
    mapping(uint256 => mapping(address => bool)) hasUserReportedPost;
    mapping(uint256 => uint256) postReports;
    mapping(address => uint256) timesReported;
    mapping(address => bool) public bannedUsers;

    // Function to create a user profile
    function createUserProfile(string memory _userProfileCID) public {
        require(!bannedUsers[msg.sender], "You are banned from this platform");
        UserProfile memory userProfile = UserProfile(
            msg.sender,
            _userProfileCID
        );
        Profiles[msg.sender] = userProfile;
        allProfiles.push(userProfile);
        isProfileCreated[msg.sender] = true;
    }

    // Function to update user profile
    function updateProfile(string memory _newProfileCID) public {
        require(
            isProfileCreated[msg.sender],
            "Profile does not exist. Create a profile first."
        );

        UserProfile storage userProfile = Profiles[msg.sender];
        userProfile.userProfileCID = _newProfileCID;

        // Update the profile in the allProfiles array
        for (uint256 i = 0; i < allProfiles.length; i++) {
            if (allProfiles[i].userAddress == msg.sender) {
                allProfiles[i] = userProfile;
                break;
            }
        }
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
        require(!isPostSaved[msg.sender][_postId]);
        userSavedPosts[msg.sender].push(idToPost[_postId]);
        isPostSaved[msg.sender][_postId] = true;
    }

    // Function to delete a saved post
    // function deleteSavedPost(uint256 _postId) public {
    //     Post storage savedPost = idToPost[_postId];
    //     require(savedPost.postOwner != address(0), "Post does not exist");

    //     Post[] storage savedPosts = userSavedPosts[msg.sender];
    //     uint256 savedPostIndex = findSavedPostIndex(savedPosts, _postId);
    //     require(savedPostIndex < savedPosts.length, "Saved post not found");

    //     savedPosts[savedPostIndex] = savedPosts[savedPosts.length - 1];
    //     savedPosts.pop();
    // }

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

    // Function to report a post
    function reportPost(uint256 _postId) public {
        require(
            !hasUserReportedPost[_postId][msg.sender],
            "You can only report a post once"
        );

        postReports[_postId]++;
        hasUserReportedPost[_postId][msg.sender] = true;

        if (postReports[_postId] >= calculateReportThreshold()) {
            deleteReportedPost(_postId);
        }
    }

    // Function to calculate the report threshold based on user base
    function calculateReportThreshold() internal view returns (uint256) {
        uint256 userBase = allProfiles.length; // Assuming allProfiles represents all registered users

        if (userBase <= 100) {
            return (userBase * 20) / 100;
        } else if (userBase > 100 && userBase <= 1000) {
            return (userBase * 10) / 100;
        } else if (userBase > 1000 && userBase <= 10000) {
            return (userBase * 5) / 100;
        } else if (userBase > 10000 && userBase <= 50000) {
            return (userBase * 2) / 100;
        } else if (userBase > 50000 && userBase <= 100000) {
            return (userBase * 1) / 100;
        } else if (userBase > 100000 && userBase <= 500000) {
            return (userBase * 5) / 1000;
        } else if (userBase > 500000 && userBase <= 1000000) {
            return (userBase * 1) / 1000;
        } else {
            return (userBase * 5) / 10000;
        }
    }

    // Function to delete a reported post
    function deleteReportedPost(uint256 _postId) private {
        Post memory postToDelete = idToPost[_postId];
        require(postToDelete.postId != 0, "Post does not exist");

        uint256 postIndex = findPostIndex(_postId);
        require(postIndex < allPosts.length, "Post not found");

        // Check if the post has been reported more than 5 times
        if (timesReported[idToPost[_postId].postOwner] >= 4) {
            // Delete the user's profile and posts
            deleteProfile(idToPost[_postId].postOwner);
        } else {
            // Otherwise, delete the post
            timesReported[idToPost[_postId].postOwner]++;
            allPosts[postIndex] = allPosts[allPosts.length - 1];
            allPosts.pop();

            Post[] storage userPostList = userPosts[idToPost[_postId].postOwner];
            uint256 userPostIndex = findUserPostIndex(userPostList, _postId);
            if (userPostIndex < userPostList.length) {
                userPostList[userPostIndex] = userPostList[userPostList.length - 1];
                userPostList.pop();
            }


            delete idToPost[_postId];
        }
    }

    function deleteProfile(address _postOwner) public {
        require(isProfileCreated[_postOwner], "Profile does not exist");

        // Ban the user
        bannedUsers[_postOwner] = true;

        // Delete user's posts from allPosts
        Post[] storage userPostList = userPosts[_postOwner];
        for (uint256 i = 0; i < userPostList.length; i++) {
            delete idToPost[userPostList[i].postId];
            deletePostFromAllPosts(userPostList[i].postId);
        }
        delete userPosts[_postOwner];

        // Delete user's saved posts
        Post[] storage savedPosts = userSavedPosts[_postOwner];
        for (uint256 i = 0; i < savedPosts.length; i++) {
            delete idToPost[savedPosts[i].postId];
        }
        delete userSavedPosts[_postOwner];

        // Delete user's followers and following information
        UserProfile[] storage followers = userFollowerProfiles[_postOwner];
        for (uint256 i = 0; i < followers.length; i++) {
            address followerAddress = followers[i].userAddress;
            removeProfile(userFollowingProfiles[followerAddress], _postOwner);
            delete isUserFollowing[followerAddress][_postOwner];
        }
        delete userFollowerProfiles[_postOwner];

        UserProfile[] storage following = userFollowingProfiles[_postOwner];
        for (uint256 i = 0; i < following.length; i++) {
            address followingAddress = following[i].userAddress;
            removeProfile(userFollowerProfiles[followingAddress], _postOwner);
            delete isUserFollowing[_postOwner][followingAddress];
        }
        delete userFollowingProfiles[_postOwner];

        // Remove user's profile from allProfiles
        removeProfile(allProfiles, _postOwner);

        // Remove user's posts from allPosts
        removeUserPostsFromAllPosts(_postOwner);

        // Reset user's follower and following counts
        userFollowerCount[_postOwner] = 0;
        userFollowingCount[_postOwner] = 0;
    }

    // Internal function to remove user's posts from allPosts
    function removeUserPostsFromAllPosts(address userAddress) internal {
        for (uint256 i = 0; i < allPosts.length; i++) {
            if (allPosts[i].postOwner == userAddress) {
                allPosts[i] = allPosts[allPosts.length - 1];
                allPosts.pop();
                i--; // Check the replaced element again
            }
        }
    }

    // Internal function to delete a post from allPosts
    function deletePostFromAllPosts(uint256 postId) internal {
        uint256 postIndex = findPostIndex(postId);
        if (postIndex < allPosts.length) {
            allPosts[postIndex] = allPosts[allPosts.length - 1];
            allPosts.pop();
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
    function getUserPosts(
        address _userAddress
    ) public view returns (Post[] memory) {
        return userPosts[_userAddress];
    }

    function getUserPostsLength(
        address _userAddress
    ) public view returns (uint256) {
        return userPosts[_userAddress].length;
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

    function getIsPostSaved(uint256 _postId) public view returns (bool) {
        return isPostSaved[msg.sender][_postId];
    }

    function isReported(uint256 _postId) public view returns(bool){
        return hasUserReportedPost[_postId][msg.sender];
    }
}
