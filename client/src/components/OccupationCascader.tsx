// 职业三级联动选择器组件
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getOccupationLevels, 
  getOccupationCategories, 
  getOccupationDetails 
} from '../services/api';
import { ChevronDown, X } from 'lucide-react';

interface OccupationLevel {
  industry_large_code: string;
  industry_large_name: string;
}

interface OccupationCategory {
  industry_medium_code: string;
  industry_medium_name: string;
}

interface OccupationDetail {
  occupation_id: number;
  occupation_detail_code: string;
  occupation_detail_name: string;
  occupation_level: number;
  industry_small_name?: string;
}

interface OccupationCascaderProps {
  value?: {
    levelCode?: string;
    levelName?: string;
    categoryCode?: string;
    categoryName?: string;
    detailCode?: string;
    detailName?: string;
    occupationLevel?: number;
  };
  onChange?: (value: {
    levelCode: string;
    levelName: string;
    categoryCode: string;
    categoryName: string;
    detailCode: string;
    detailName: string;
    occupationLevel: number;
  } | null) => void;
  companyId?: number;
  productId?: number;
  placeholder?: string;
}

const OccupationCascader: React.FC<OccupationCascaderProps> = ({
  value,
  onChange,
  companyId,
  productId,
  placeholder = '请选择要查询的职业',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [levels, setLevels] = useState<OccupationLevel[]>([]);
  const [categories, setCategories] = useState<OccupationCategory[]>([]);
  const [details, setDetails] = useState<OccupationDetail[]>([]);
  
  const [selectedLevel, setSelectedLevel] = useState<OccupationLevel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<OccupationCategory | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<OccupationDetail | null>(null);
  
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const cascaderRef = useRef<HTMLDivElement>(null);
  const loadingLevelsRef = useRef<Set<string>>(new Set());
  const loadingCategoriesRef = useRef<Set<string>>(new Set());
  const loadingDetailsRef = useRef<Set<string>>(new Set());

  // 加载一级分类（行业大分类）
  const loadLevels = useCallback(async () => {
    if (loadingLevelsRef.current.has('levels')) return;
    loadingLevelsRef.current.add('levels');
    
    setLoadingLevels(true);
    try {
      const data = await getOccupationLevels(companyId, productId);
      setLevels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载职业一级分类失败:', error);
      setLevels([]);
    } finally {
      setLoadingLevels(false);
      loadingLevelsRef.current.delete('levels');
    }
  }, [companyId, productId]);

  // 加载二级分类（行业中分类）
  const loadCategories = useCallback(async (levelCode: string) => {
    const key = `categories-${levelCode}`;
    if (loadingCategoriesRef.current.has(key)) return;
    loadingCategoriesRef.current.add(key);
    
    setLoadingCategories(true);
    try {
      const data = await getOccupationCategories(levelCode, companyId, productId);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载职业二级分类失败:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
      loadingCategoriesRef.current.delete(key);
    }
  }, [companyId, productId]);

  // 加载三级分类（具体职业）
  const loadDetails = useCallback(async (levelCode: string, categoryCode: string) => {
    const key = `details-${levelCode}-${categoryCode}`;
    if (loadingDetailsRef.current.has(key)) return;
    loadingDetailsRef.current.add(key);
    
    setLoadingDetails(true);
    try {
      const data = await getOccupationDetails(levelCode, categoryCode, companyId, productId);
      setDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('加载职业三级分类失败:', error);
      setDetails([]);
    } finally {
      setLoadingDetails(false);
      loadingDetailsRef.current.delete(key);
    }
  }, [companyId, productId]);

  // 初始化值
  useEffect(() => {
    if (value?.levelCode && value?.categoryCode && value?.detailCode) {
      setSelectedLevel({
        industry_large_code: value.levelCode,
        industry_large_name: value.levelName || '',
      });
      setSelectedCategory({
        industry_medium_code: value.categoryCode,
        industry_medium_name: value.categoryName || '',
      });
      setSelectedDetail({
        occupation_id: 0,
        occupation_detail_code: value.detailCode,
        occupation_detail_name: value.detailName || '',
        occupation_level: value.occupationLevel || 0,
      });
    } else {
      setSelectedLevel(null);
      setSelectedCategory(null);
      setSelectedDetail(null);
    }
  }, [value?.levelCode, value?.categoryCode, value?.detailCode]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cascaderRef.current && !cascaderRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      loadLevels();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, loadLevels]);

  // 选择一级分类
  const handleSelectLevel = (level: OccupationLevel) => {
    setSelectedLevel(level);
    setSelectedCategory(null);
    setSelectedDetail(null);
    setCategories([]);
    setDetails([]);
    loadCategories(level.industry_large_code);
  };

  // 选择二级分类
  const handleSelectCategory = (category: OccupationCategory) => {
    if (!selectedLevel) return;
    setSelectedCategory(category);
    setSelectedDetail(null);
    setDetails([]);
    loadDetails(selectedLevel.industry_large_code, category.industry_medium_code);
  };

  // 选择三级分类（具体职业）
  const handleSelectDetail = (detail: OccupationDetail) => {
    setSelectedDetail(detail);
    setIsOpen(false);
    
    if (onChange && selectedLevel && selectedCategory) {
      onChange({
        levelCode: selectedLevel.industry_large_code,
        levelName: selectedLevel.industry_large_name,
        categoryCode: selectedCategory.industry_medium_code,
        categoryName: selectedCategory.industry_medium_name,
        detailCode: detail.occupation_detail_code,
        detailName: detail.occupation_detail_name,
        occupationLevel: detail.occupation_level,
      });
    }
  };

  // 清除选择
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSelectedDetail(null);
    setCategories([]);
    setDetails([]);
    if (onChange) {
      onChange(null);
    }
  };

  const displayText = selectedDetail
    ? `${selectedLevel?.industry_large_name || ''} > ${selectedCategory?.industry_medium_name || ''} > ${selectedDetail.occupation_detail_name} (${selectedDetail.occupation_level}类)`
    : placeholder;

  return (
    <div className="relative" ref={cascaderRef}>
      <div
        className="w-full border border-gray-300 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDetail ? 'text-gray-800' : 'text-gray-400'}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selectedDetail && (
            <X
              size={14}
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg flex" style={{ minWidth: '600px' }}>
          {/* 一级分类 */}
          <div className="border-r border-gray-200 overflow-y-auto" style={{ maxHeight: '400px', minWidth: '150px' }}>
            {loadingLevels ? (
              <div className="p-4 text-sm text-gray-400 text-center">加载中...</div>
            ) : levels.length === 0 ? (
              <div className="p-4 text-sm text-gray-400 text-center">暂无数据</div>
            ) : (
              levels.map((level) => (
                <div
                  key={level.industry_large_code}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                    selectedLevel?.industry_large_code === level.industry_large_code
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700'
                  }`}
                  onClick={() => handleSelectLevel(level)}
                >
                  {level.industry_large_name}
                  {selectedLevel?.industry_large_code === level.industry_large_code && (
                    <span className="ml-2">›</span>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 二级分类 */}
          {selectedLevel && (
            <div className="border-r border-gray-200 overflow-y-auto" style={{ maxHeight: '400px', minWidth: '200px' }}>
              {loadingCategories ? (
                <div className="p-4 text-sm text-gray-400 text-center">加载中...</div>
              ) : categories.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">暂无数据</div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.industry_medium_code}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                      selectedCategory?.industry_medium_code === category.industry_medium_code
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleSelectCategory(category)}
                  >
                    {category.industry_medium_name}
                    {selectedCategory?.industry_medium_code === category.industry_medium_code && (
                      <span className="ml-2">›</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 三级分类（具体职业） */}
          {selectedLevel && selectedCategory && (
            <div className="overflow-y-auto" style={{ maxHeight: '400px', minWidth: '250px' }}>
              {loadingDetails ? (
                <div className="p-4 text-sm text-gray-400 text-center">加载中...</div>
              ) : details.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">暂无数据</div>
              ) : (
                details.map((detail) => (
                  <div
                    key={detail.occupation_id}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                      selectedDetail?.occupation_detail_code === detail.occupation_detail_code
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700'
                    }`}
                    onClick={() => handleSelectDetail(detail)}
                  >
                    {detail.occupation_detail_name} ({detail.occupation_level}类)
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OccupationCascader;

