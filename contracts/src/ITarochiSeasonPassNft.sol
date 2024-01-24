// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

/// @dev A standard ERC721 that accepts calldata in the mint function for any initialization data needed in a Paima dApp.
interface ITarochiSeasonPassNft {
    /// @dev Emitted when max supply is updated from `oldMaxSupply` to `newMaxSupply`.
    event UpdateMaxSupply(uint256 indexed oldMaxSupply, uint256 indexed newMaxSupply);

    /// @dev Emitted when `newMinter` is added to the mapping of allowed `minters`.
    event SetMinter(address indexed newMinter);

    /// @dev Emitted when `oldMinter` is removed from the mapping of allowed `minters`
    event RemoveMinter(address indexed oldMinter);

    /// @dev Emitted when `baseUri` is updated from `oldUri` to `newUri`.
    event SetBaseURI(string oldUri, string newUri);

    /// @dev Emitted when a new token with ID `tokenId` is minted, with `initialData` provided in the `mint` function parameters.
    event Minted(uint256 indexed tokenId, string initialData);

    /// @dev Emitted when the mint deadline is updated from `oldDeadline` to `newDeadline`.
    event UpdateDeadline(uint256 indexed oldDeadline, uint256 indexed newDeadline);

    /// @dev Mints a new token to address `_to`, passing `initialData` to be emitted in the event.
    /// Increases the `totalSupply` and `currentTokenId`.
    /// Reverts if `totalSupply` is not less than `maxSupply` or if `_to` is a zero address.
    /// Emits the `Minted` event.
    function mint(address _to, string calldata initialData) external returns (uint256);

    /// @dev Burns token of ID `_tokenId`. Callable only by the owner of the specified token.
    /// Reverts if `_tokenId` is not existing.
    function burn(uint256 _tokenId) external;

    /// @dev Adds `_minter` to the mapping of allowed `minters` of this NFT.
    /// Callable only by the contract owner.
    /// Emits the `SetMinter` event.
    function setMinter(address _minter) external;

    /// @dev Removes `_minter` from the mapping of allowed `minters` of this NFT.
    /// Callable only by the contract owner.
    /// Emits the `RemoveMinter` event.
    function removeMinter(address _minter) external;

    /// @dev Sets `_URI` as the `baseURI` of the NFT.
    /// Callable only by the contract owner.
    /// Emits the `SetBaseURI` event.
    function setBaseURI(string memory _URI) external;

    /// @dev Sets `_newBaseExtension` as the `baseExtension` of the NFT.
    /// Callable only by the contract owner.
    function setBaseExtension(string memory _newBaseExtension) external;

    /// @dev Changes the minting deadline to `_mintDeadline`.
    /// Callable only by the contract owner.
    function updateMintDeadline(uint256 _mintDeadline) external;

    /// @dev Sets `_maxSupply` as the `maxSupply` of the NFT.
    /// Callable only by the contract owner.
    /// Emits the `UpdateMaxSupply` event.
    function updateMaxSupply(uint256 _maxSupply) external;

    /// @dev Returns true if specified `_tokenId` exists.
    function exists(uint256 _tokenId) external view returns (bool);

    /// @dev Returns true if `_account` is in the mapping of allowed `minters`.
    function isMinter(address _account) external view returns (bool);
}
