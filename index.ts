export const getPunks = async () => {
  const apiKey = process.env.API_KEY;
  const contractAddress = "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb";

  // Fetch data
  const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTsForCollection?contractAddress=${contractAddress}&withMetadata=true`;
  const res = await fetch(url);
  const data = await res.json();

  // Loop through pages
  let { nextToken, nfts } = data;
  while (nextToken) {
    try {
      const res = await fetch(`${url}&startToken=${nextToken}`);
      const data = await res.json();
      console.log(
        `Fetching ${data.nfts.length} NFTs and have collected ${nfts.length} NFTs so far.`
      );
      nfts.push(...data.nfts);
      nextToken = data.nextToken;
    } catch (error) {
      console.log(error);
      break;
    }
  }

  // Filter out punks
  console.log(`Total NFTs for collection: ${nfts.length}`);
  const punkData = nfts.map((nft: any) => {
    const { contractMetadata, id } = nft;

    const tokenId = parseInt(id.tokenId);
    const openSeaImageUrl = contractMetadata.openSea.imageUrl;

    return { tokenId, openSeaImageUrl };
  });

  // Output csv file of a list of punk images
  await Bun.write(
    "punks.csv",
    punkData
      .map((data: any) => `${data.tokenId},${data.openSeaImageUrl}`)
      .join("\n")
  );

  return 0;
};

(async () => getPunks())();
