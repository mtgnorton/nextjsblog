'use client';


export default function Profile() {
  return (
    <div className="flex flex-col gap-4 py-3">
      <div>
      我是一名开发工程师,熟悉后端开发,了解k8s,了解前端
      </div>
       <div>
       联系方式: &nbsp; &nbsp;
        <a 
          href="mailto:ma19921212@gmail.com" 
          className="text-link border-b-2 border-b-underline hover:text-hover"
        >
        ma19921212@gmail.com
        </a>
       </div>
    </div>
  );
}
