// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract InteractionsRegistry is ReentrancyGuard{
    using SafeMath for uint256;

    /// @dev Credit Info for every accounts
    mapping(address => AccountCreditInfo) private _creditInfo;

    /// @dev Struct for account credit info
    struct AccountCreditInfo {
        address account;
        uint256 ethAmount;
    }

    /// note Account needs to pay ether to submit a interaction.
	uint256 private constant PRICE_PER_INTERACTION = 0.5 ether;

    /// Event
    event AddCredit(address indexed account, uint256 numCredit);
    event RemoveCredit(address indexed account, uint256 numCredit);
    event SumbitInteraction(address indexed sender, address indexed receiver, address senderApp, address receiverApp, uint256 amount);

    // Function to receive Ether. msg.data must be empty
    // receive() external payable {}

    // Fallback function is called when msg.data is not empty
    // fallback() external payable {}

    /**
     * @dev Add credit
     * @param numCredit Adding credit num for account. Should pay equivalent number of ETH
     */
    function addCredit(uint256 numCredit) public payable {
        require(msg.value >= numCredit, "Insufficient funds to add credit");

        AccountCreditInfo storage accCreditInfo = _creditInfo[msg.sender];
        accCreditInfo.account = msg.sender;
        accCreditInfo.ethAmount = accCreditInfo.ethAmount.add(numCredit);

        emit AddCredit(msg.sender, numCredit);
    }

    /**
     * @dev Remove credit
     * @param numCredit Removing credit num for account. Will receive equivalent number of ETH
     */
    function removeCredit(uint256 numCredit) public payable nonReentrant {
        AccountCreditInfo storage accCreditInfo = _creditInfo[msg.sender];

        require(numCredit > 0, "Value must be bigger than 0");
        require(accCreditInfo.ethAmount >= numCredit, "Not enough credit to remove");

        accCreditInfo.ethAmount = accCreditInfo.ethAmount.sub(numCredit);
        (bool success,) = msg.sender.call{value: numCredit}("");
        require(success, "Sending ETH failed");

        emit RemoveCredit(msg.sender, numCredit);
    }

    /**
     * @dev Submit interaction
     * @param sender Sender address who pays fee
     * @param receiver Receiver address who will receive 50% of fee
     * @param senderAppAddr Sender Dapp address who will receive 25% of fee
     * @param receiverAppAddr Receiver Dapp address who will receive 25% of fee
     */
    function submitInteraction(address sender, address receiver, address senderAppAddr, address receiverAppAddr) public payable nonReentrant{
        AccountCreditInfo storage creditInfo = _creditInfo[sender];

        require(msg.value >= PRICE_PER_INTERACTION, "Insufficient funds");
        require(creditInfo.ethAmount >= msg.value, "Insufficient credit");
        uint256 receiverAmount = msg.value / 2;
        uint256 appAmount = msg.value / 4;
        (bool success1,) = payable(receiver).call{value: receiverAmount}("");
        require(success1, "Sending ETH failed");
        (bool success2,) = payable(senderAppAddr).call{value: appAmount}("");
        require(success2, "Sending ETH failed");
        (bool success3,) = payable(receiverAppAddr).call{value: appAmount}("");
        require(success3, "Sending ETH failed");

        creditInfo.ethAmount = creditInfo.ethAmount.sub(msg.value);

        emit SumbitInteraction(sender, receiver, senderAppAddr, receiverAppAddr, msg.value);
    }

    /**
     * @dev Get account credit info
     * @param _user Will get this user's info
     */
    function getCreditInfo(address _user) public view returns(address account, uint256 ethAmount) {
        AccountCreditInfo memory creditInfo = _creditInfo[_user];
        account = creditInfo.account;
        ethAmount = creditInfo.ethAmount;
    }
}