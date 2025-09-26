import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ProfileMovieForm() {
    const [searchParams] = useSearchParams();
    const selectedMovie = searchParams.get('movie') || 'ボタニカ';
    const [activeSection, setActiveSection] = useState(null);

    const sections = {
        info: [
            { id: 'couple-info', title: 'おふたりの情報 (名前・挙式日)', description: 'Your Information (Name, Wedding Date)' },
            { id: 'music-dvd', title: '音楽・DVDについて', description: 'About Music and DVD' }
        ],
        photos: [
            { id: 'cover-greeting', title: '表紙・挨拶', description: 'Cover/Greeting' },
            { id: 'groom-part', title: '新郎パート', description: 'Groom\'s Part' },
            { id: 'bride-part', title: '新婦パート', description: 'Bride\'s Part' },
            { id: 'couple-part', title: 'おふたりパート', description: 'Couple\'s Part' },
            { id: 'last-part', title: 'ラスト', description: 'Last' },
            { id: 'children-part', title: 'お子様パート (追加ご注文された方のみ)', description: 'Children\'s Part (Only for those who ordered additionally)' }
        ]
    };

    const faqs = [
        {
            q: 'パートナーに共有したいです',
            a: '○○をして共有できます。'
        },
        {
            q: '動画を入れたいです',
            a: '可能です。入れたい部分が始まりになるよう「切り取り (トリミング)」 してから添付してください。'
        }
    ];

    const handleSectionClick = (sectionId) => {
        setActiveSection(activeSection === sectionId ? null : sectionId);
    };

    return (
        <div className="min-h-screen bg-[#F9F6EF] py-16">
            <div className="max-w-4xl mx-auto px-4">
                {/* Main Title */}
                <div className="text-center mb-8 mt-16">
                    <h1 className="text-3xl font-bold text-[#215261]">
                        プロフィールムービー 「{selectedMovie}」
                    </h1>
                </div>

                {/* Sample Video Section */}
                <div className="text-center mb-12">
                    <div className="relative inline-block">
                        <div className="w-96 h-64 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {/* Video Thumbnail */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                    <div className="text-xs text-gray-600 bg-white bg-opacity-80 px-2 py-1 rounded">
                                        [結婚式プロフィール...]
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">サンプルムービー</div>
                    </div>
                </div>

                {/* Information Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-1 h-8 bg-gray-600 mr-3"></div>
                        <h2 className="text-xl font-semibold text-[#215261]">おふたりの情報</h2>
                    </div>
                    <div className="space-y-2">
                        {sections.info.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSectionClick(item.id)}
                                className="bg-[#E6B372] hover:bg-gray-200 p-4 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-[#191919]">{item.title}</div>
                                    <div className="text-sm text-gray-600">{item.description}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Photos and Messages Section */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-1 h-8 bg-gray-600 mr-3"></div>
                        <h2 className="text-xl font-semibold text-[#215261]">お写真・メッセージ</h2>
                    </div>
                    <div className="space-y-2">
                        {sections.photos.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleSectionClick(item.id)}
                                className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-[#191919]">{item.title}</div>
                                    <div className="text-sm text-gray-600">{item.description}</div>
                                </div>
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-pink-500 text-center mb-6">よくある質問</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="font-medium text-[#215261] mb-2">
                                    <span className="text-blue-600">Q.</span> {faq.q}
                                </div>
                                <div className="text-gray-600 ml-4">
                                    <span className="text-green-600">A.</span> {faq.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex gap-4 justify-between">
                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors">
                            一時保存する
                        </button>
                        <button className="bg-[#215261] hover:from-orange-500 hover:to-yellow-500 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                            送信する (ムービー作成を依頼)
                        </button>
                    </div>
                </div>

                {/* Active Section Modal */}
                {activeSection && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                    {sections.info.find(s => s.id === activeSection)?.title || 
                                     sections.photos.find(s => s.id === activeSection)?.title}
                                </h3>
                                <button
                                    onClick={() => setActiveSection(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="text-gray-600 mb-4">
                                {sections.info.find(s => s.id === activeSection)?.description || 
                                 sections.photos.find(s => s.id === activeSection)?.description}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ファイルをアップロード
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        メッセージ (任意)
                                    </label>
                                    <textarea
                                        className="w-full p-2 border border-gray-300 rounded-lg h-20"
                                        placeholder="メッセージを入力してください..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={() => setActiveSection(null)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={() => setActiveSection(null)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
                                >
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
