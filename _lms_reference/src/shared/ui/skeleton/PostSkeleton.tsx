import { Container } from "@mui/material";

const PostSkeleton = () => {
  return (
    <div className="skeleton-loading-list py-12">
      <Container>
        <div className="skeleton-item animate-pulse">
          <div className="header py-12">
            <div className="title mb-12">
              <div className="bg-gray-100 max-w-[760px] h-6 rounded-xl mx-auto mb-4"></div>
              <div className="bg-gray-100 w-[80%] max-w-[480px] h-6 rounded-xl mx-auto"></div>
            </div>
            <div className="content mb-12">
              <div className="bg-gray-100 max-w-[560px] h-2 rounded-xl mx-auto mb-3"></div>
              <div className="bg-gray-100 max-w-[320px] h-2 rounded-xl mx-auto mb-3"></div>
            </div>
            <div className="bg-gray-100 max-w-[480px] h-12 rounded-xl mx-auto mb-12"></div>
            <div className="flex items-center flex-wrap gap-3 mb-12">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-gray-100 w-24 h-10 rounded-xl"></div>
              ))}
            </div>
            <div>
              <div
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
              >
                <div className="flex items-center justify-center w-full aspect-[9/5] bg-gray-200 rounded-sm md:w-1/2">
                  <svg
                    className="w-10 h-10 text-gray-300"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded-full mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded-full max-w-[440px] mb-6"></div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full max-w-[440px]"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
export default PostSkeleton;
