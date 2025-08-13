import React from "react";
import UsersGrid from "./usersGrid/UsersGrid";
import { createEntries } from "./utils/createEntries"; 
function App() {
  const entries = createEntries(20);

  return (
    <div className="w-full h-screen bg-gray-100">
      <UsersGrid originalData={entries} />
    </div>
  );
}

export default App;
