pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SYCoin is ERC20, Ownable {
    uint256 public constant RATE = 1 ether; 

    constructor(uint256 initialSupply) ERC20("SY Coin", "SYC") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function buySYC() public payable {
        require(msg.value > 0, "Harus mengirim ETH");
        uint256 sycAmount = msg.value / RATE; 
        _mint(msg.sender, sycAmount);
    }

    function sellSYC(uint256 sycAmount) public {
        require(balanceOf(msg.sender) >= sycAmount, "Saldo SYC tidak cukup");
        uint256 ethAmount = sycAmount * RATE; 
        _burn(msg.sender, sycAmount); 
        payable(msg.sender).transfer(ethAmount);
    }

    function withdrawETH() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Fungsi untuk menerima ETH dan mengonversinya ke SYC
    receive() external payable {
        require(msg.value > 0, "Harus mengirim ETH");
        uint256 sycAmount = msg.value / RATE;
        _mint(msg.sender, sycAmount);
    }
}