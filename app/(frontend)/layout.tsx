import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';

export default function FrontendLayout({ 
  children
}: { 
  children: React.ReactNode;
}) {
  // Render normal frontend layout with Header/Footer for all routes
  return (
    <div>
      {/* <Header /> */}
      <main>{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
