/** Preset Solidity sources for Contract Playground */

export const CONTRACT_TEMPLATE_IDS = ['counter', 'simple-storage', 'erc20']

export const CONTRACT_TEMPLATE_LABELS = {
  counter: 'Counter',
  'simple-storage': 'Simple Storage',
  erc20: 'ERC20 Token',
}

export const CONTRACT_TEMPLATES = {
  counter: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    function increment() external {
        count += 1;
    }
}
`,

  'simple-storage': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private favoriteNumber;

    function store(uint256 _favoriteNumber) external {
        favoriteNumber = _favoriteNumber;
    }

    function retrieve() external view returns (uint256) {
        return favoriteNumber;
    }
}
`,

  erc20: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Minimal ERC-20-style token for playground demos (not audited).
contract PlaygroundToken {
    string public name = "Playground Token";
    string public symbol = "PGT";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 initialSupplyWholeTokens) {
        totalSupply = initialSupplyWholeTokens * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "PlaygroundToken: balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
`,
}
