"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import InnerBanner from "@/components/common/InnerBanner";
import useApi from "@/utils/useApi";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

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
  updatedAt: string;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  // Use React's use() hook to unwrap the Promise synchronously
  const { slug } = use(params);
  
  const [blog, setBlog] = useState<Blog | null>(null);

  // Set page title
  useEffect(() => {
    if (blog) {
      const pageTitle = blog.seoTitle || blog.title;
      document.title = `My Waldo | ${pageTitle}`;
    } else {
      const pageTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      document.title = `My Waldo | ${pageTitle}`;
    }
  }, [blog, slug]);

  const { data, loading: apiLoading, error: apiError, fetchApi } = useApi({
    url: `/api/users/blog/${slug}`,
    type: "manual",
    method: "GET",
    requiresAuth: false,
  });

  // Fetch blog when slug is available
  useEffect(() => {
    if (slug) {
      fetchApi();
    }
  }, [slug]);

  // Update blog when data is received
  useEffect(() => {
    if (data) {
      setBlog(data);
    }
  }, [data]);

  return (
    <>
      <InnerBanner 
        bannerClass="blog-banner capitalize" 
        title={blog?.title || slug.replace(/-/g, ' ')} 
      />

      <section className="sec-gap">
        <div className="container">
          {apiLoading ? (
            <div className="text-center py-8 loading-text">Loading blog...</div>
          ) : apiError ? (
            <div className="text-center py-8 text-red-500">Error loading blog: {apiError}</div>
          ) : blog ? (
            <article className="blog-detail-content max-w-4xl mx-auto">
              {/* Blog Image */}
              {blog.imageUrl && (
                <div className="blog-detail-image mb-8">
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
                </div>
              )}

              {/* Blog Header */}
              <div className="blog-detail-header mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white/90 mb-4">
                  {blog.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Published: {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {blog.updatedAt !== blog.createdAt && (
                    <span>
                      Updated: {new Date(blog.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Blog Description/Content */}
              {blog.description && (
                <div className="blog-detail-description prose prose-lg max-w-none dark:prose-invert">
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blog.description.replace(/\n/g, '<br />') }}
                  />
                </div>
              )}

              {/* SEO Meta (hidden but for SEO) */}
              {(blog.seoTitle || blog.seoDescription) && (
                <div className="hidden">
                  {blog.seoTitle && <meta name="title" content={blog.seoTitle} />}
                  {blog.seoDescription && <meta name="description" content={blog.seoDescription} />}
                </div>
              )}
            </article>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">Blog not found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

