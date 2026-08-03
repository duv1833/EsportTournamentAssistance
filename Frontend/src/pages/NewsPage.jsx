import React, { useState } from 'react';
import { Newspaper, ChevronRight, Calendar } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export default function NewsPage() {
  const [newsList] = useState([
    {
      id: 1,
      title: "CẬP NHẬT LUẬT THI ĐẤU VCT CHALLENGERS VN 2024",
      date: "25 THÁNG 11, 2024",
      category: "THÔNG BÁO",
      desc: "Những thay đổi quan trọng về luật cấm/chọn bản đồ và đặc vụ sẽ được áp dụng ngay trong vòng loại sắp tới.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_wpD57ytk-6gs-XPJbV7cwaGhIGM7xh2S1qb0CFy6VTBQ2OqLbpqoqnWkvq5i3VpjpPKXcy9KLt498Bbax9UsqTOElprCICQI5dcNQqb6p-Wyeiwy9-xp9RHjGrpqB4Y96atlgM4d2pY5C3NWR7oq_pQL6_-R53kn-C-CE2xkqF2sGs4myz0_bac4inRzDAmjXe47IVJBouJAVHyzob_hrCZ6JLRPBeHWbnz_SxBTpeAgnOk0kUBf",
    },
    {
      id: 2,
      title: "RA MẮT TÍNH NĂNG LIVE DRAFTING",
      date: "20 THÁNG 11, 2024",
      category: "TÍNH NĂNG MỚI",
      desc: "Hệ thống ban/pick trực tuyến theo thời gian thực đã chính thức ra mắt, hỗ trợ cho tất cả các giải đấu trên nền tảng.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAER0m_QbffpvEOhDh4xOrOzH912B3vSl1X4czCOe4AgIHH9GCCtepY1tmINqSrLkvK6qxL33RP1hhve9i55pSJj1Sd_3KISThEU2iPxLROXkt7vXdNguQjs7j7NU_dLDcHBdJTrvQlCz7zxXzTWpaaD4GQR61wnExShZSKIQWOnCZv1WiJGt8A0dyIBR8JTuiM_qnzTJrCDSUeHIaZf-BXZGwMcS-hGXdkj2h1S-dEqp1tEkgS0lc24vY1wskD9ccCfw",
    }
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-6 md:px-12 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h2 className="font-display text-4xl text-off-white uppercase mb-2">TIN TỨC & THÔNG BÁO</h2>
          <p className="font-mono text-sm text-tactical-gray">// CẬP NHẬT NHỮNG SỰ KIỆN MỚI NHẤT</p>
        </div>
      </div>
      
      {newsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {newsList.map((news) => (
            <article key={news.id} className="bg-surface-charcoal border border-outline-variant group hover:border-primary-red transition-all clip-corner-top overflow-hidden flex flex-col h-full cursor-pointer">
              <div className="h-64 overflow-hidden relative">
                <div className="absolute top-4 left-4 z-10 bg-primary-red text-off-white font-mono text-xs px-3 py-1 font-bold">
                  {news.category}
                </div>
                <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-tactical-gray font-mono text-xs mb-3">
                  <Calendar size={14} /> {news.date}
                </div>
                <h3 className="font-display text-2xl text-off-white uppercase leading-tight mb-4 group-hover:text-primary-red transition-colors">
                  {news.title}
                </h3>
                <p className="font-body text-off-white/70 text-sm mb-6 flex-grow">
                  {news.desc}
                </p>
                <div className="flex items-center text-primary-red font-mono text-xs font-bold uppercase gap-1 mt-auto group-hover:gap-2 transition-all">
                  ĐỌC TIẾP <ChevronRight size={14} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Newspaper}
          title="Chưa có tin mới"
          desc="Tin tức và thông báo mới nhất từ các giải đấu sẽ xuất hiện tại đây."
        />
      )}
    </div>
  );
}
