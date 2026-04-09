import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index(process.env.PINECONE_INDEX!);

type PineconeIndexDeleteMethods = {
  deleteOne?: (id: string) => Promise<unknown>;
  deleteMany?: (ids: string[]) => Promise<unknown>;
  delete?: (request: { ids: string[] }) => Promise<unknown>;
};

export async function deleteVectorById(id: string): Promise<void> {
  const vectorIndex = index as unknown as PineconeIndexDeleteMethods;

  if (typeof vectorIndex.deleteOne === 'function') {
    await vectorIndex.deleteOne(id);
    return;
  }

  if (typeof vectorIndex.deleteMany === 'function') {
    await vectorIndex.deleteMany([id]);
    return;
  }

  if (typeof vectorIndex.delete === 'function') {
    await vectorIndex.delete({ ids: [id] });
    return;
  }

  throw new Error('Pinecone delete method is not available on the configured index client.');
}
