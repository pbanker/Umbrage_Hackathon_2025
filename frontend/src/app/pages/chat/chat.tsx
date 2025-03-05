import React, { useState } from "react";
import { ChatItem } from "../../components/chat-item";
import { ChatSettings } from "../../components/chat-settings";

const ChatPage: React.FC = () => {
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <div className="flex p-5 gap-5 grow shrink-0">
      <div className="flex flex-col self-stretch w-1/4">
        <input
          type="text"
          placeholder="Search chats"
          className="mb-4 p-2 rounded-lg bg-white"
        />
        <div className="flex flex-col grow space-y-4 rounded-lg bg-white">
          <ChatItem />
          <ChatItem />
          <ChatItem />
        </div>
      </div>
      <div
        className={`flex items-start self-stretch gap-5 flex-col ${
          settingsVisible ? "w-2/4" : "w-3/4"
        }`}
      >
        <div className="flex items-center justify-between self-stretch bg-white rounded-lg p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-full w-8 h-8 bg-gray-400"></div>
            <div className="flex flex-col text-gray-400">
              <div className="font-bold">John Doe</div>
              <div className="text-sm">Company XYZ</div>
            </div>
          </div>
          <img
            className="w-6 h-6"
            src="/icons/more-vertical.svg"
            alt=""
            onClick={() => setSettingsVisible(!settingsVisible)}
          />
        </div>
        <div className="flex flex-col self-stretch p-5 h-full bg-white rounded-lg">
          <div className="flex-grow overflow-y-auto mb-4">
            {/* Chat history messages */}
          </div>
          <div className="flex flex-col gap-2.5">
            <textarea
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded mr-2"
            ></textarea>
            <button className="p-2 bg-blue-500 text-white rounded">Send</button>
          </div>
        </div>
      </div>
      {settingsVisible && <ChatSettings />}
    </div>
  );
};

export default ChatPage;
