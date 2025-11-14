// contracts/SYCoin.sol
// SPDX-License-Identifier: MIT
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
        // sycAmount dalam smallest unit (18 desimal)
        //  syc = (wei * 10^decimals) / RATE
        uint256 sycAmount = (msg.value * (10 ** decimals())) / RATE;
        _mint(msg.sender, sycAmount);
    }

    function sellSYC(uint256 sycAmount) public {
        require(balanceOf(msg.sender) >= sycAmount, "Saldo SYC tidak cukup");
        // ethAmount = (syc * RATE) / 10^decimals
        uint256 ethAmount = (sycAmount * RATE) / (10 ** decimals());
        _burn(msg.sender, sycAmount);
        (bool ok, ) = payable(msg.sender).call{value: ethAmount}("");
        require(ok, "Gagal transfer ETH");
    }

    function withdrawETH() public onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Gagal withdraw");
    }

    receive() external payable {
        require(msg.value > 0, "Harus mengirim ETH");
        uint256 sycAmount = (msg.value * (10 ** decimals())) / RATE;
        _mint(msg.sender, sycAmount);
    }
}
