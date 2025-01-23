import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function ContentPage(props: { params: Promise<{ title: string }> }) {
    const params = await props.params;

    return (
        <div>
            <h1> title: {decodeURIComponent(params.title)}</h1>
        </div>
    )
}