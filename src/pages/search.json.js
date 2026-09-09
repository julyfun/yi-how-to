import {getCollectionByName} from "../utils/getCollectionByName.js";

async function getBlogs(context) {
  const blog = await getCollectionByName('blog')
  return blog.map(blog => {
    return {
      slug: blog.slug,
      title: blog.data.title,
      description: blog.data.description,
      date: blog.data.date,
      category: blog.data.category,
      tags: blog.data.tags,
      // Development has no built HTML index; keep production metadata small.
      ...(import.meta.env.DEV ? {body: blog.body} : {}),
    }
  })
}

export async function GET({}) {
  return new Response(JSON.stringify(await getBlogs()), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}
