// 地区级联选择器组件
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getProvinces, getRegions } from '../services/api';

interface Region {
  region_id: number;
  region_code: string;
  region_name: string;
}

interface RegionCascaderProps {
  value?: {
    provinceId?: number;
    cityId?: number;
    districtId?: number;
    province?: string;
    city?: string;
    district?: string;
  };
  onChange?: (value: {
    provinceId?: number;
    cityId?: number;
    districtId?: number;
    province?: string;
    city?: string;
    district?: string;
  }) => void;
  deniedRegions?: string[]; // 被限制的地区列表
  placeholder?: string;
  disabled?: boolean;
}

const RegionCascader: React.FC<RegionCascaderProps> = ({
  value = {},
  onChange,
  deniedRegions = [],
  placeholder = '请选择企业所在地',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [selectedCity, setSelectedCity] = useState<Region | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 加载省份列表
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('加载省份失败:', error);
      }
    };
    loadProvinces();
  }, []);

  // 根据value初始化选中状态（使用useRef避免无限循环）
  const initializedRef = useRef<{
    provinceId?: number;
    cityId?: number;
    districtId?: number;
  }>({});
  
  // 只在value.provinceId变化时初始化省份（避免依赖cities导致无限循环）
  useEffect(() => {
    if (value.provinceId && provinces.length > 0) {
      const province = provinces.find((p) => p.region_id === value.provinceId);
      if (province && initializedRef.current.provinceId !== value.provinceId) {
        setSelectedProvince(province);
        initializedRef.current.provinceId = value.provinceId;
        // 只有在城市列表为空时才加载（避免重复加载）
        if (cities.length === 0) {
          loadCities(value.provinceId);
        }
      }
    } else if (!value.provinceId && selectedProvince) {
      initializedRef.current.provinceId = undefined;
      setSelectedProvince(null);
      setCities([]);
      setDistricts([]);
    }
  }, [value.provinceId, provinces.length]); // 只依赖value.provinceId和provinces.length
  
  // 当城市列表变化时，如果value中有cityId，则选中（使用cities.length避免依赖数组引用）
  useEffect(() => {
    if (value.cityId && cities.length > 0) {
      const city = cities.find((c) => c.region_id === value.cityId);
      if (city && initializedRef.current.cityId !== value.cityId) {
        setSelectedCity(city);
        initializedRef.current.cityId = value.cityId;
        // 只有在区县列表为空时才加载（避免重复加载）
        if (districts.length === 0) {
          loadDistricts(value.cityId);
        }
      }
    } else if (!value.cityId && selectedCity) {
      initializedRef.current.cityId = undefined;
      setSelectedCity(null);
      setDistricts([]);
    }
  }, [value.cityId, cities.length]); // 依赖cities.length而不是cities数组，避免无限循环
  
  // 当区县列表变化时，如果value中有districtId，则选中（使用districts.length避免依赖数组引用）
  useEffect(() => {
    if (value.districtId && districts.length > 0) {
      const district = districts.find((d) => d.region_id === value.districtId);
      if (district && initializedRef.current.districtId !== value.districtId) {
        setSelectedDistrict(district);
        initializedRef.current.districtId = value.districtId;
      }
    } else if (!value.districtId && selectedDistrict) {
      initializedRef.current.districtId = undefined;
      setSelectedDistrict(null);
    }
  }, [value.districtId, districts.length]); // 依赖districts.length而不是districts数组，避免无限循环

  // 加载城市列表（使用ref避免重复请求和无限循环）
  const loadingCitiesRef = useRef<Set<number>>(new Set());
  const loadCities = useCallback(async (provinceId: number) => {
    // 防止重复加载：如果正在加载同一个省份，则跳过
    if (loadingCitiesRef.current.has(provinceId)) {
      return;
    }
    loadingCitiesRef.current.add(provinceId);
    
    setLoading(true);
    try {
      const data = await getRegions({ level: 2, parent_id: provinceId });
      setCities(Array.isArray(data) ? data : []);
      setDistricts([]);
      // 如果value中没有cityId，清空选择
      if (!value.cityId) {
        setSelectedCity(null);
        setSelectedDistrict(null);
        initializedRef.current.cityId = undefined;
        initializedRef.current.districtId = undefined;
      }
    } catch (error) {
      console.error('加载城市失败:', error);
    } finally {
      setLoading(false);
      loadingCitiesRef.current.delete(provinceId);
    }
  }, []); // 不依赖任何state，避免无限循环

  // 加载区县列表（使用ref避免重复请求和无限循环）
  const loadingDistrictsRef = useRef<Set<number>>(new Set());
  const loadDistricts = useCallback(async (cityId: number) => {
    // 防止重复加载：如果正在加载同一个城市，则跳过
    if (loadingDistrictsRef.current.has(cityId)) {
      return;
    }
    loadingDistrictsRef.current.add(cityId);
    
    setLoading(true);
    try {
      const data = await getRegions({ level: 3, parent_id: cityId });
      setDistricts(Array.isArray(data) ? data : []);
      // 如果value中没有districtId，清空选择
      if (!value.districtId) {
        setSelectedDistrict(null);
        initializedRef.current.districtId = undefined;
      }
    } catch (error) {
      console.error('加载区县失败:', error);
    } finally {
      setLoading(false);
      loadingDistrictsRef.current.delete(cityId);
    }
  }, []); // 不依赖任何state，避免无限循环

  // 选择省份
  const handleSelectProvince = (province: Region) => {
    setSelectedProvince(province);
    setSelectedCity(null);
    setSelectedDistrict(null);
    loadCities(province.region_id);
  };

  // 选择城市
  const handleSelectCity = (city: Region) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
    loadDistricts(city.region_id);
  };

  // 选择区县
  const handleSelectDistrict = (district: Region) => {
    setSelectedDistrict(district);
    
    // 触发onChange
    if (onChange) {
      onChange({
        provinceId: selectedProvince?.region_id,
        cityId: selectedCity?.region_id,
        districtId: district.region_id,
        province: selectedProvince?.region_name,
        city: selectedCity?.region_name,
        district: district.region_name,
      });
    }
    
    // 关闭面板
    setOpen(false);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // 显示文本
  const displayText = value.district
    ? `${value.province} / ${value.city} / ${value.district}`
    : value.city
    ? `${value.province} / ${value.city}`
    : value.province
    ? value.province
    : placeholder;

  // 检查地区是否被限制
  const isRegionDenied = (regionName: string) => {
    return deniedRegions.includes(regionName);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* 输入框 */}
      <div
        className={`flex items-center justify-between w-full rounded border px-3 py-2 text-sm cursor-pointer ${
          disabled
            ? 'bg-gray-100 cursor-not-allowed'
            : open
            ? 'border-blue-500 ring-1 ring-blue-500'
            : isRegionDenied(value.province || '')
            ? 'border-red-500'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span
          className={`flex-1 ${
            !value.province ? 'text-gray-400' : isRegionDenied(value.province || '') ? 'text-red-500' : 'text-gray-900'
          }`}
        >
          {displayText}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* 错误提示 */}
      {isRegionDenied(value.province || '') && (
        <p className="text-red-500 text-xs mt-1">该地区（{value.province}）暂不支持投保</p>
      )}

      {/* 下拉面板 */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="flex" style={{ width: '600px', maxHeight: '300px' }}>
            {/* 省份列 */}
            <div className="flex-1 border-r border-gray-200 overflow-y-auto">
              {loading && provinces.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">加载中...</div>
              ) : (
                provinces.map((province) => {
                  const isSelected = selectedProvince?.region_id === province.region_id;
                  const isDenied = isRegionDenied(province.region_name);
                  
                  return (
                    <div
                      key={province.region_id}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50 text-blue-600' : isDenied ? 'text-red-500' : ''
                      }`}
                      onClick={() => handleSelectProvince(province)}
                    >
                      <span className="flex-1">{province.region_name}</span>
                      {isDenied && (
                        <span className="text-xs text-red-500 ml-2">(不支持)</span>
                      )}
                      {!isDenied && (
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 城市列 */}
            {selectedProvince && cities.length > 0 && (
              <div className="flex-1 border-r border-gray-200 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">加载中...</div>
                ) : (
                  cities.map((city) => {
                    const isSelected = selectedCity?.region_id === city.region_id;
                    
                    return (
                      <div
                        key={city.region_id}
                        className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => handleSelectCity(city)}
                      >
                        <span className="flex-1">{city.region_name}</span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 区县列 */}
            {selectedCity && districts.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">加载中...</div>
                ) : (
                  districts.map((district) => {
                    const isSelected = selectedDistrict?.region_id === district.region_id;
                    
                    return (
                      <div
                        key={district.region_id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                          isSelected ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                        onClick={() => handleSelectDistrict(district)}
                      >
                        {district.region_name}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionCascader;

