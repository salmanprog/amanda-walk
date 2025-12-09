"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import InnerBanner from "@/components/common/InnerBanner";
import useApi from "@/utils/useApi";

interface Blog {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: boolean;
  createdAt: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Set page title
  useEffect(() => {
    document.title = "My Waldo | Blog";
  }, []);

  const { data, loading: apiLoading, error: apiError, fetchApi } = useApi({
    url: "/api/users/blog",
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  // Fetch blogs on mount
  useEffect(() => {
    fetchApi();
  }, []);

  // Update blogs when data is received
  useEffect(() => {
    if (data && Array.isArray(data)) {
      setBlogs(data);
    }
  }, [data]);

  return (
    <>
      <InnerBanner bannerClass="blog-banner" title="Blog" />
      <section className="blog-section sec-gap">
        <div className="container">
          {apiLoading ? (
            <div className="text-center py-8 loading-text">Loading blogs...</div>
          ) : apiError ? (
            <div className="text-center py-8 text-red-500">Error loading blogs: {apiError}</div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="blog-card group">
                  <div className="blog-card-image">
                    {blog.imageUrl ? (
                      <Image
                      src={blog.imageUrl.startsWith("http")
                        ? blog.imageUrl
                        : `${blog.imageUrl}`
                      }
                      alt={blog.title || "Blog image"}
                      width={400}
                      height={264}
                      className="w-full h-[264px] object-cover rounded"
                      unoptimized
                    />
                    ) : (
                      <div className="w-full h-[264px] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="blog-card-content">
                    <span className="blog-card-date">
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <h3 className="blog-card-title line-clamp-2">{blog.title}</h3>
                    {blog.description && (
                      <p className="blog-card-description line-clamp-3">{blog.description}</p>
                    )}
                  </div>
                  <div className="blog-hidden-content">
                    <Link href={`/blog/${blog.slug}`} className="btn btn-primary w-full flex justify-center items-center gap-2">
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No blogs found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

