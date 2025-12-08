import React from 'react';

const FAQ: React.FC = () => {
  const questions = [
    {
      id: 1,
      question: "为什么手机APP上操作不了团险订单？",
      answer: "尊敬的用户，很抱歉告知您，目前团险仅支持通过PC端保单助手进行投保以及后续操作，移动端应用操作将在未来支持，感谢您的理解！"
    },
    {
      id: 2,
      question: "电子保单在哪里下载？",
      answer: "您可以进入“保单管理”页面，找到对应的保单订单，点击详情进入保单详情页，在页面右上角点击“下载电子保单”按钮即可进行下载。"
    },
    {
      id: 3,
      question: "如何进行人员替换或增减员？",
      answer: "请在“保单管理”中找到对应保单，点击“团险批单”或“人员管理”功能。目前支持在线批量导入人员清单进行替换、增加或减少被保人操作。审核通过后次日零时生效。"
    },
    {
      id: 4,
      question: "发票申请需要多久开具？",
      answer: "在“保全售后管理” -> “发票中心”提交申请后，电子发票通常会在1-3个工作日内发送至您预留的企业联系人邮箱，请注意查收。"
    },
    {
      id: 5,
      question: "职业类别如何界定？",
      answer: "在投保页面的“职业类别查询”输入框中输入具体的工种名称（如：行政、司机、电工等），系统会自动匹配对应的职业代码和类别。请务必如实申报，以免影响后续理赔。"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-4">
        <h2 className="text-2xl font-medium text-gray-800 tracking-wide">常见问题汇总</h2>
      </div>

      <div className="space-y-4">
        {questions.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-lg">
                {item.id}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-sm mt-8">
        <p>没找到您的问题？请联系客服热线：<span className="text-blue-600 font-bold text-lg mx-1">400-646-9898</span> (工作日 9:00-18:00)</p>
      </div>
    </div>
  );
};

export default FAQ;