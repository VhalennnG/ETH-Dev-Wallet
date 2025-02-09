pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SYCoin is ERC20, Ownable {
    uint256 public constant RATE = 1 ether; // 1 SYC = 1 ETH

    constructor(uint256 initialSupply) ERC20("SY Coin", "SYC") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Fungsi untuk membeli SYC dengan ETH
    function buySYC() public payable {
        require(msg.value > 0, "Harus mengirim ETH");
        uint256 sycAmount = msg.value / RATE; // Hitung jumlah SYC yang dibeli
        _mint(msg.sender, sycAmount);
    }

    // Fungsi untuk menjual SYC dan mendapatkan ETH kembali
    function sellSYC(uint256 sycAmount) public {
        require(balanceOf(msg.sender) >= sycAmount, "Saldo SYC tidak cukup");
        uint256 ethAmount = sycAmount * RATE; // Hitung jumlah ETH yang diterima
        _burn(msg.sender, sycAmount); // Bakar SYC yang dijual
        payable(msg.sender).transfer(ethAmount); // Kirim ETH ke pengguna
    }

    // Fungsi untuk menarik ETH dari kontrak (hanya owner)
    function withdrawETH() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}