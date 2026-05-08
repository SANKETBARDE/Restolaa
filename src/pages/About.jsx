import { Award, Users, Clock, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-[#D4A017]">Restola</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Where passion meets palate, creating unforgettable culinary experiences
          </p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Restola was born from a simple dream: to create a space where food 
              lovers could gather, celebrate, and create lasting memories. What 
              started as a small family restaurant has grown into a beloved 
              culinary destination.
            </p>
            <p className="text-gray-600 mb-4">
              Our founder, Chef Antonio, brought his grandmother's secret recipes 
              and combined them with modern culinary techniques to create a unique 
              fusion of tradition and innovation.
            </p>
            <p className="text-gray-600">
              Today, Restola continues to honor its roots while embracing new 
              flavors and techniques, always with the goal of delighting our guests.
            </p>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800"
              alt="Our story"
              className="rounded-xl shadow-xl"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { number: "10+", label: "Years of Excellence" },
            { number: "50K+", label: "Happy Customers" },
            { number: "100+", label: "Menu Items" },
            { number: "25", label: "Expert Chefs" },
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-bold text-[#D4A017] mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Passion", desc: "We pour our heart into every dish we create" },
              { icon: Award, title: "Quality", desc: "Only the finest ingredients make it to your plate" },
              { icon: Users, title: "Community", desc: "We believe in building lasting relationships" },
              { icon: Clock, title: "Service", desc: "Timely service without compromising quality" },
            ].map((value, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#D4A017]/10 rounded-full flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-[#D4A017]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Chef Antonio", role: "Head Chef", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400" },
              { name: "Maria Garcia", role: "Sous Chef", img: "https://images.unsplash.com/photo-1583394293214-28ezi3f83dd?auto=format&fit=crop&w=400" },
              { name: "James Wilson", role: "Pastry Chef", img: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=400" },
            ].map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-48 h-48 mx-auto rounded-full object-cover mb-4 shadow-lg"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-[#D4A017]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
