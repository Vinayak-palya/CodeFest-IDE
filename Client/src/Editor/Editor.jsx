import SideBar from "./SideBar.jsx";
import Monaco from "./Monaco.jsx";
import ChatAI from "./ChatAI.jsx";
import { useState } from "react";

const Editor = ({ Data }) => {
  const [data, setdata] = useState(Data);
  const [tabFiles, setTabFiles] = useState([]);
  const [activeTab, setActiveTab] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [currentCode, setCurrentCode] = useState(
    tabFiles[activeTab]?.content || ""
    
  );


  const handleCodeChange = (newCode) => {
    setCurrentCode(newCode);
    const updatedFiles = [...tabFiles];
    updatedFiles[activeTab] = {
      ...updatedFiles[activeTab],
      content: newCode,
    };
    setTabFiles(updatedFiles);
  };
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('vs-dark');

  const handleFontSizeChange = (delta) => {
    setFontSize(prevSize => Math.max(8, Math.min(30, prevSize + delta)));
  };

  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'vs-dark' ? 'light' : 'vs-dark'));
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
  };

  const getLanguage = (file) => {
    const extension = file.split(".").pop();
    switch (extension) {
      case "js":
        return "javascript";
      case "py":
        return "python";
      case "cpp":
        return "cpp";
      case "java":
        return "java";
      case "ts":
        return "typescript";
      case "go":
        return "go";
      case "rs":
        return "rust";
      case "cs":
        return "csharp";
      default:
        return "text";
    }
  };


  const addFile = (file) => {
    // Check if the file is already in the array by its id
    const fileExists = tabFiles.some((tabFile) => tabFile.id === file.id);
    if (!fileExists) {
      setTabFiles([...tabFiles, file]);
      setActiveTab(tabFiles.length);
    } else {
      // Optionally, you can set the active tab to the existing file
      const existingFileIndex = tabFiles.findIndex(
        (tabFile) => tabFile.id === file.id
      );
      setActiveTab(existingFileIndex);
    }
  };
  const handleSave = async () => {
    const data1 = {content: currentCode};
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/file/save/${tabFiles[activeTab].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data1),
      });
      const res = await response.json();
      const file = res.data.file;
      const updateData = (node) => {
        if (node._id === file.id) {
          return { ...node, content: file.content };
        }
        return {
          ...node,
          children: node.children.map(updateData),
          files: node.files.map(updateData),
        };
      };

      setdata(updateData(data));
      console.log("saved");

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="fixed inset-0 flex bg-gray-900">
    <SideBar 
      position="left" 
      fontSize={fontSize}
      onFontSizeChange={handleFontSizeChange}
      theme={theme}
      onThemeToggle={handleThemeToggle}
      onThemeSelect={handleThemeSelect}
      data={data.data} addFile={addFile}
    />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Tabs bar */}
        <div className="h-9 flex items-center bg-gray-800 border-b border-gray-700 justify-between">
          <div className="flex flex-row px-1">
          {tabFiles.length > 0 &&
            tabFiles.map((file, index) => (
              <div
                key={index}
                className={`cursor-pointer h-8 text-sm text-gray-300 ${
                  index == activeTab ? "bg-gray-700" : "bg-gray-800"
                } border-b-2 border-transparent hover:text-white hover:bg-gray-700 flex flex-row justify-between items-center`}
              >
                <button
                  className="cursor-pointer h-full w-full px-2"
                  onClick={() => {
                    setActiveTab(index);
                  }}
                >
                  {file.name}
                </button>
                {
                  <button
                    onClick={() => {
                      if (index <= activeTab) {
                        setActiveTab(activeTab - 1);
                      }
                      setTabFiles(tabFiles.filter((_, i) => i != index));
                    }}
                    className={`w-6 h-6 px-2 mr-1 ml-1 text-sm rounded-full cursor-pointer hover:bg-gray-900 hover:text-white  ${
                      index == activeTab ? " text-white" : "text-gray-800"
                    }`}
                  >
                    x
                  </button>
                }
              </div>
            ))}
          </div>
          <button onClick={()=>{handleSave()}} className="mx-2 px-2 border rounded cursor-pointer my-2 hover:bg-blue-700 hover:text-white">Save</button>


        </div>

        <div className="flex-1 relative">
          {tabFiles.length > 0 && (
            <Monaco
              key={activeTab}
              file={tabFiles[activeTab].content}
              language={getLanguage(tabFiles[activeTab].name)}
              onCodeChange={handleCodeChange}
              fontSize={fontSize}
              theme={theme}
            />
          )}
          <ChatAI />
        </div>
      </div>
      {tabFiles.length > 0 && <SideBar
        position="right"
        code={tabFiles[activeTab]?.content}
        language={getLanguage(tabFiles[activeTab]?.name)}
      />}
    </div>
  );
};

export default Editor;