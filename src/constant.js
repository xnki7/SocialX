const contractAddress = "0xa8E4eA01537C54B5e677de4C913611136A9a5740";

const contractABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "_commentCID",
                "type": "string"
            }
        ],
        "name": "commentOnPost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_postCID",
                "type": "string"
            }
        ],
        "name": "createPost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_userProfileCID",
                "type": "string"
            }
        ],
        "name": "createUserProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            }
        ],
        "name": "deletePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            }
        ],
        "name": "deleteSavedPost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            }
        ],
        "name": "dislikePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "followUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            }
        ],
        "name": "likePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_postId",
                "type": "uint256"
            }
        ],
        "name": "savePost",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "unfollowUser",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "allPosts",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "postId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "postOwner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "postTimestamp",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "postCID",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllPosts",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "postId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "postOwner",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "postTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "postCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.Post[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "getIsProfileCreated",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "getUserFollowers",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "userProfileCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.UserProfile[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "getUserFollowings",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "userProfileCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.UserProfile[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUserPosts",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "postId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "postOwner",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "postTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "postCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.Post[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_userAddress",
                "type": "address"
            }
        ],
        "name": "getUserProfile",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "userAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "userProfileCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.UserProfile",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getUserSavedPosts",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "postId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "postOwner",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "postTimestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "postCID",
                        "type": "string"
                    }
                ],
                "internalType": "struct SocialX.Post[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export { contractAddress, contractABI };