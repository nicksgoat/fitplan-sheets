
import React from "react";

const Liked: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Liked Programs</h1>
      <p className="text-gray-400">
        You haven't liked any programs yet. Browse the library to find programs you like.
      </p>
    </div>
  );
};

export default Liked;
