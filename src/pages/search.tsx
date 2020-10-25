import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { Document } from 'prismic-javascript/types/documents';
import Prismic from 'prismic-javascript';
import PrismicDom from 'prismic-dom';
import { GetServerSideProps } from 'next';
import { client } from '@/lib/prismic';
import Link from 'next/link';

interface SearchProps {
  searchResults: Document[];
}

export default function Search({ searchResults }: SearchProps) {
  const [search, setSearch] = useState('');
  const router = useRouter()

  function handleSearch (e: FormEvent) {
    e.preventDefault();

    router.push(
      `/search?q=${encodeURIComponent(search)}`
    )

    setSearch('');
  }

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input type='text' value={search} onChange={ e => setSearch(e.target.value)} />
        <button type='submit'>Search</button>
      </form>


      <ul>
      {searchResults.map(searchResult => {
        return (
          <li key={searchResult.id}>
            <Link href={`catalog/products/${searchResult.uid}`}>
                <a>
                  {PrismicDom.RichText.asText(searchResult.data.title)}
                </a>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async (context) => {
  const { q } = context.query;

  if (!q) {
    return { props: { searchResults: [] }};
  }

  const searchResults = await client().query([
    Prismic.Predicates.at('document.type', 'product'),
    Prismic.Predicates.fulltext('my.product.title', String(q))
  ])

  return {
    props: {
      searchResults: searchResults.results,
    }
  }
}
