import React from 'react';
import { Leaf } from 'lucide-react';

const FacultyHeader = ({ facultyData }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Leaf size={36} />
            EcoLearn Faculty Portal
          </h1>
          <p className="text-emerald-100 mt-1">
            {facultyData.name}
          </p>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            
            
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold"></div>
           
          </div>
        </div>
      </div>
    </header>
  );
};

export default FacultyHeader;