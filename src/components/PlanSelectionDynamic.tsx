// 动态方案选择组件 - 从后台配置系统获取数据
import React, { useState, useEffect, useRef } from 'react';
import { useProductPlans } from '../hooks/useProductPlans';
import { calculatePremium, getInterceptRules } from '../services/api';
import { PlanConfig, CompanyInfo } from '../types';
import RegionCascader from './RegionCascader';

interface PlanSelectionDynamicProps {
  plans: PlanConfig[];
  setPlans: (p: PlanConfig[]) => void;
  companyInfo: CompanyInfo;
  setCompanyInfo: (c: CompanyInfo) => void;
  onNext: () => void;
  premiums?: Record<string, number>; // 从外部传入的保费信息（用于保持状态）
  setPremiums?: (p: Record<string, number>) => void; // 更新保费信息
  selectedProductId?: number | null; // 从外部传入的产品ID（用于保持状态）
  setSelectedProductId?: (id: number | null) => void; // 更新产品ID
  selectedPlanIds?: Record<string, number>; // 从外部传入的方案ID映射（用于保持状态）
  setSelectedPlanIds?: (ids: Record<string, number>) => void; // 更新方案ID映射
  commonDuration?: string; // 统一的保障期限
  setCommonDuration?: (d: string) => void; // 更新统一的保障期限
}

const PlanSelectionDynamic: React.FC<PlanSelectionDynamicProps> = ({
  plans,
  setPlans,
  companyInfo,
  setCompanyInfo,
  onNext,
  premiums: externalPremiums,
  setPremiums: setExternalPremiums,
  selectedProductId: externalSelectedProductId,
  setSelectedProductId: setExternalSelectedProductId,
  selectedPlanIds: externalSelectedPlanIds,
  setSelectedPlanIds: setExternalSelectedPlanIds,
  commonDuration: externalCommonDuration,
  setCommonDuration: setExternalCommonDuration,
}) => {
  const [internalSelectedProductId, setInternalSelectedProductId] = useState<number | null>(null);
  const [internalSelectedPlanIds, setInternalSelectedPlanIds] = useState<Record<string, number>>({});
  const [internalPremiums, setInternalPremiums] = useState<Record<string, number>>({});
  const [internalCommonDuration, setInternalCommonDuration] = useState<string>('1年');
  const [loading, setLoading] = useState(false);
  
  // 使用外部传入的状态，如果没有则使用内部state
  const selectedProductId = externalSelectedProductId !== undefined ? externalSelectedProductId : internalSelectedProductId;
  const setSelectedProductId = setExternalSelectedProductId || setInternalSelectedProductId;
  const selectedPlanIds = externalSelectedPlanIds !== undefined ? externalSelectedPlanIds : internalSelectedPlanIds;
  const setSelectedPlanIds = setExternalSelectedPlanIds || setInternalSelectedPlanIds;
  const premiums = externalPremiums !== undefined ? externalPremiums : internalPremiums;
  const setPremiums = setExternalPremiums || setInternalPremiums;
  const commonDuration = externalCommonDuration !== undefined ? externalCommonDuration : internalCommonDuration;
  const setCommonDuration = setExternalCommonDuration || setInternalCommonDuration;
  
  // 拦截规则（地区限制）
  const [interceptRules, setInterceptRules] = useState<{
    region_restriction?: {
      denied_regions?: string[];
    };
  }>({});

  const {
    products,
    plans: availablePlans,
    planLiabilities,
    loading: dataLoading,
    fetchProducts,
    fetchPlans,
    fetchPlanLiabilities,
  } = useProductPlans(selectedProductId || undefined);

  // 初始化时获取产品列表
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // 校验企业所在地
  const validateRegion = (): boolean => {
    if (!companyInfo.provinceId || !companyInfo.province) {
      alert('请选择企业所在地（省-市-区）');
      return false;
    }
    
    if (!companyInfo.cityId || !companyInfo.city) {
      alert('请选择企业所在地（市）');
      return false;
    }
    
    if (!companyInfo.districtId || !companyInfo.district) {
      alert('请选择企业所在地（区县）');
      return false;
    }
    
    // 检查地区限制（拦截规则）
    if (companyInfo.province && interceptRules.region_restriction?.denied_regions) {
      const deniedRegions = interceptRules.region_restriction.denied_regions;
      if (deniedRegions.includes(companyInfo.province)) {
        alert(`该地区（${companyInfo.province}）暂不支持投保`);
        return false;
      }
    }
    
    return true;
  };

  // 当责任配置加载完成后，初始化默认值（只在没有现有选择时初始化）
  useEffect(() => {
    console.log(`[前端] ========== 责任配置加载检查 ==========`);
    console.log(`[前端] planLiabilities keys:`, Object.keys(planLiabilities));
    console.log(`[前端] 当前plans数量:`, plans.length);
    
    // 使用最新的plans（从props传入）
    plans.forEach((plan) => {
      const planId = selectedPlanIds[plan.id];
      console.log(`[前端] 检查方案 ${plan.id}, planId: ${planId}`);
      
      if (planId && planLiabilities[planId]) {
        const liabilities = planLiabilities[planId];
        console.log(`[前端] ✅ 方案 ${plan.id} 的责任配置已加载，数量: ${liabilities.length}`);
        
        // 检查当前plan中是否已有责任选择（从父组件传入的plans中读取）
        const currentSelections = plan.liabilitySelections || {};
        const hasSelections = Object.keys(currentSelections).length > 0;
        
        // 只有在完全没有选择时才初始化，避免覆盖用户已选择的内容
        if (!hasSelections) {
          console.log(`[前端] 初始化方案 ${plan.id} 的默认责任选择`);
          const defaultSelections: Record<number, string> = {};
          liabilities.forEach((liability) => {
            if (liability.default_coverage) {
              defaultSelections[liability.liability_id] = liability.default_coverage;
            }
          });
          
          if (Object.keys(defaultSelections).length > 0) {
            console.log(`[前端] 设置默认责任选择:`, defaultSelections);
            handleUpdatePlan(plan.id, 'liabilitySelections', defaultSelections);
          } else {
            console.log(`[前端] ⚠️ 方案 ${plan.id} 没有默认责任配置`);
          }
        } else {
          console.log(`[前端] 方案 ${plan.id} 已有责任选择，保留现有选择:`, currentSelections);
        }
      } else {
        console.log(`[前端] ⏳ 方案 ${plan.id} 的责任配置尚未加载 (planId: ${planId})`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planLiabilities, selectedPlanIds]); // 移除plans依赖，避免在plans变化时重新初始化导致责任选择丢失

  // 当选择产品时，获取方案列表和拦截规则
  useEffect(() => {
    if (selectedProductId) {
      fetchPlans(selectedProductId);
      loadInterceptRules(selectedProductId);
    } else {
      setInterceptRules({});
    }
  }, [selectedProductId]);
  
  // 当返回上一页时，确保所有已选择方案的责任配置都已加载
  useEffect(() => {
    console.log(`[前端] ========== 检查并加载所有方案的责任配置 ==========`);
    console.log(`[前端] 当前plans数量: ${plans.length}`);
    console.log(`[前端] selectedPlanIds:`, selectedPlanIds);
    console.log(`[前端] planLiabilities keys:`, Object.keys(planLiabilities));
    
    // 遍历所有方案，确保已选择方案的责任配置都已加载
    const loadPromises: Promise<void>[] = [];
    plans.forEach((plan) => {
      const planId = selectedPlanIds[plan.id];
      if (planId && !planLiabilities[planId]) {
        console.log(`[前端] 方案 ${plan.id} (planId: ${planId}) 的责任配置未加载，开始加载...`);
        loadPromises.push(fetchPlanLiabilities(planId).then(() => {
          console.log(`[前端] ✅ 方案 ${plan.id} (planId: ${planId}) 的责任配置加载完成`);
        }).catch((error) => {
          console.error(`[前端] ❌ 方案 ${plan.id} (planId: ${planId}) 的责任配置加载失败:`, error);
        }));
      } else if (planId && planLiabilities[planId]) {
        console.log(`[前端] ✅ 方案 ${plan.id} (planId: ${planId}) 的责任配置已加载，数量: ${planLiabilities[planId].length}`);
      } else if (!planId) {
        console.log(`[前端] ⏳ 方案 ${plan.id} 尚未选择具体方案（planId为空）`);
      }
    });
    
    // 等待所有加载完成
    if (loadPromises.length > 0) {
      Promise.all(loadPromises).then(() => {
        console.log(`[前端] 所有方案的责任配置加载完成`);
      });
    }
  }, [plans.length, selectedPlanIds]); // 当plans数量或selectedPlanIds变化时，检查并加载责任配置
  
  // 加载拦截规则
  const loadInterceptRules = async (productId: number) => {
    try {
      const rules = await getInterceptRules(productId);
      setInterceptRules(rules || {});
      console.log('[前端] 拦截规则加载完成:', rules);
    } catch (error) {
      console.error('加载拦截规则失败:', error);
      setInterceptRules({});
    }
  };

  // 当选择方案时，获取方案的责任配置
  const handleSelectPlan = async (planInstanceId: string, planId: number) => {
    console.log(`[前端] ========== 切换方案开始 ==========`);
    console.log(`[前端] planInstanceId: ${planInstanceId}, planId: ${planId}`);
    console.log(`[前端] 当前selectedPlanIds:`, selectedPlanIds);
    
    // 更新selectedPlanIds
    setSelectedPlanIds((prev) => {
      const updated = {
        ...prev,
        [planInstanceId]: planId,
      };
      console.log(`[前端] selectedPlanIds更新:`, prev, '->', updated);
      return updated;
    });

    // 获取方案的责任配置
    console.log(`[前端] 开始获取方案责任配置，planId: ${planId}`);
    await fetchPlanLiabilities(planId);
    // 注意：fetchPlanLiabilities 是异步的，但状态更新是异步的
    // 所以这里读取 planLiabilities[planId] 可能还是旧值
    // 我们会在 useEffect 中自动处理，这里只记录日志
    console.log(`[前端] 方案责任配置API调用完成，等待状态更新...`);

    // 更新方案配置，并初始化默认责任选择
    const plan = availablePlans.find((p) => p.plan_id === planId);
    console.log(`[前端] 找到的方案:`, plan ? { plan_id: plan.plan_id, plan_name: plan.plan_name, duration_options: plan.duration_options } : '未找到');
    
    if (plan) {
      // 获取该方案的责任配置，初始化默认值
      // 注意：由于状态更新是异步的，这里可能读取不到最新值
      // 但我们会通过 useEffect 在状态更新后自动处理
      const liabilities = planLiabilities[planId] || [];
      console.log(`[前端] 方案责任数量: ${liabilities.length} (planId: ${planId})`);
      console.log(`[前端] planLiabilities对象keys:`, Object.keys(planLiabilities));
      console.log(`[前端] planLiabilities[${planId}]:`, planLiabilities[planId]);
      
      const defaultSelections: Record<number, string> = {};
      if (liabilities.length > 0) {
        liabilities.forEach((liability) => {
          if (liability.default_coverage) {
            defaultSelections[liability.liability_id] = liability.default_coverage;
          }
        });
        console.log(`[前端] 默认责任选择:`, defaultSelections);
      } else {
        console.log(`[前端] ⚠️ 责任配置尚未加载，将在useEffect中自动处理`);
      }

      // 默认选择1年，如果没有1年则选择第一个选项
      const defaultDuration = plan.duration_options.includes('1年') ? '1年' : (plan.duration_options[0] || '1年');
      console.log(`[前端] 初始化方案，默认保障期限: ${defaultDuration}, 可选选项:`, plan.duration_options);
      
      // 获取当前方案的投保人数（使用函数式更新确保获取最新值）
      // 注意：这里使用 plans.find 可能获取不到最新值，因为 setPlans 是异步的
      // 但我们在 useEffect 中会自动重新计算，所以这里先清除保费即可
      const currentPlan = plans.find((p) => p.id === planInstanceId);
      const insuredCount = currentPlan?.insuredCount || '';
      console.log(`[前端] 当前方案的投保人数: ${insuredCount} (从plans获取)`);
      
      // 更新方案配置
      const updatedPlans = plans.map((p) =>
        p.id === planInstanceId
          ? {
              ...p,
              name: plan.plan_name,
              duration: commonDuration || defaultDuration, // 使用统一的保障期限
              paymentType: plan.payment_type,
              liabilitySelections: defaultSelections, // 初始化默认责任选择
            }
          : p
      );
      console.log(`[前端] 更新方案配置，新方案名称: ${plan.plan_name}`);
      setPlans(updatedPlans);
      
      // 清除旧的保费，准备重新计算
      setPremiums((prev) => {
        const updated = { ...prev };
        delete updated[planInstanceId];
        console.log(`[前端] 清除旧保费，planInstanceId: ${planInstanceId}, 旧保费: ${prev[planInstanceId]}`);
        return updated;
      });
      
      // 选择方案后，清除旧保费
      // 保费计算会在 useEffect 中自动触发（当责任配置加载完成且投保人数存在时）
      console.log(`[前端] 方案切换完成，等待 useEffect 自动计算保费`);
    } else {
      console.log(`[前端] ❌ 未找到方案，planId: ${planId}`);
    }
    console.log(`[前端] ========== 切换方案结束 ==========`);
  };
  
  // 新增：使用明确的planId计算保费，不依赖state
  const handleCalculatePremiumWithPlanId = async (
    planInstanceId: string, 
    planId: number, 
    duration: string, 
    insuredCount: number | string
  ) => {
    console.log(`[前端] ========== 使用明确planId计算保费 ==========`);
    console.log(`[前端] planInstanceId: ${planInstanceId}, planId: ${planId}, duration: ${duration}, insuredCount: ${insuredCount}`);
    
    if (!selectedProductId) {
      console.log(`[前端] ❌ 没有选择产品`);
      return;
    }
    
    if (!insuredCount || insuredCount === '') {
      console.log(`[前端] ❌ 投保人数为空`);
      return;
    }
    
    // 获取方案的责任配置
    const liabilities = planLiabilities[planId] || [];
    console.log(`[前端] 方案责任数量: ${liabilities.length}`);
    
    // 获取当前plan的liabilitySelections
    const currentPlan = plans.find((p) => p.id === planInstanceId);
    const liabilitySelections = liabilities
      .filter((liability) => {
        const selectedValue = currentPlan?.liabilitySelections?.[liability.liability_id];
        return liability.is_required || selectedValue;
      })
      .map((liability) => {
        const selectedValue = currentPlan?.liabilitySelections?.[liability.liability_id] || liability.default_coverage || '';
        return {
          liability_id: liability.liability_id,
          coverage_amount: selectedValue,
          coverage_value: selectedValue,
          unit: liability.unit,
        };
      })
      .filter((item) => item.coverage_amount);
    
    console.log(`[前端] 责任选择数量: ${liabilitySelections.length}`);
    
    setLoading(true);
    try {
      console.log(`[前端] 调用calculatePremium API，planId: ${planId}, duration: ${duration}`);
      
      const result = await calculatePremium({
        product_id: selectedProductId,
        plan_id: planId,
        liability_selections: liabilitySelections,
        job_class: currentPlan?.jobClass || '1~3类',
        insured_count: typeof insuredCount === 'number' ? insuredCount : parseInt(String(insuredCount)) || 0,
        duration: duration,
      });

      console.log(`[前端] API返回结果:`, result);
      
      const premiumPerPerson = result.premium_per_person || 0;
      console.log(`[前端] ✅ 提取的每人保费: ${premiumPerPerson}`);
      
      setPremiums((prev) => {
        const updated = {
          ...prev,
          [planInstanceId]: premiumPerPerson,
        };
        console.log(`[前端] ✅ premiums更新:`, prev, '->', updated);
        return updated;
      });
    } catch (error) {
      console.error('[前端] ❌ 计算保费失败:', error);
      alert('计算保费失败，请检查方案配置是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 计算保费
  const handleCalculatePremium = async (planInstanceId: string, durationOverride?: string) => {
    console.log(`[前端] ========== 开始计算保费 ==========`);
    console.log(`[前端] planInstanceId: ${planInstanceId}`);
    console.log(`[前端] durationOverride: ${durationOverride}`);
    console.log(`[前端] selectedPlanIds:`, selectedPlanIds);
    
    const planId = selectedPlanIds[planInstanceId];
    console.log(`[前端] 从selectedPlanIds获取的planId: ${planId}`);
    
    if (!planId || !selectedProductId) {
      console.log(`[前端] ❌ 跳过保费计算 - planId: ${planId}, selectedProductId: ${selectedProductId}`);
      return;
    }

    // 使用最新的plans state，确保获取到最新的duration值
    const currentPlans = plans;
    console.log(`[前端] 当前plans数量: ${currentPlans.length}`);
    const plan = currentPlans.find((p) => p.id === planInstanceId);
    console.log(`[前端] 找到的plan:`, plan ? { id: plan.id, name: plan.name, duration: plan.duration, insuredCount: plan.insuredCount } : '未找到');
    
    if (!plan) {
      console.log(`[前端] ❌ 跳过保费计算 - 找不到plan，planInstanceId: ${planInstanceId}`);
      return;
    }
    
    if (!plan.insuredCount || plan.insuredCount === '') {
      console.log(`[前端] ❌ 跳过保费计算 - 投保人数为空，planInstanceId: ${planInstanceId}`);
      // 如果投保人数为空，清除保费显示
      setPremiums((prev) => {
        const updated = { ...prev };
        delete updated[planInstanceId];
        console.log(`[前端] 清除保费显示`);
        return updated;
      });
      return;
    }
    
    // 使用传入的durationOverride，或者使用plan中的duration
    const actualDuration = durationOverride || plan.duration || '1年';
    console.log(`[前端] 计算保费 - planInstanceId: ${planInstanceId}, plan.duration: ${plan.duration}, actualDuration: ${actualDuration}`);

    const liabilities = planLiabilities[planId] || [];
    // 从plan.liabilitySelections中获取所有已选择的责任和保额
    const liabilitySelections = liabilities
      .filter((liability) => {
        // 如果是必选责任，或者用户已选择，则包含
        const selectedValue = plan.liabilitySelections?.[liability.liability_id];
        return liability.is_required || selectedValue;
      })
      .map((liability) => {
        const selectedValue = plan.liabilitySelections?.[liability.liability_id] || liability.default_coverage || '';
        return {
          liability_id: liability.liability_id,
          coverage_amount: selectedValue,
          coverage_value: selectedValue, // 有些接口可能需要这个字段
          unit: liability.unit,
        };
      })
      .filter((item) => item.coverage_amount); // 过滤掉没有选择保额的责任

    setLoading(true);
    try {
      console.log(`[前端] 计算保费，保障期限: "${actualDuration}" (类型: ${typeof actualDuration}), 方案ID: ${planId}, 投保人数: ${plan.insuredCount}`);
      
      const result = await calculatePremium({
        product_id: selectedProductId,
        plan_id: planId,
        liability_selections: liabilitySelections,
        job_class: plan.jobClass,
        insured_count: typeof plan.insuredCount === 'number' ? plan.insuredCount : 0,
        duration: actualDuration, // 使用实际的保障期限
      });

      console.log(`[前端] 保费计算结果（原始）:`, result);
      console.log(`[前端] result类型:`, typeof result);
      console.log(`[前端] result.data:`, result.data);
      console.log(`[前端] result.premium_per_person:`, result.premium_per_person);
      
      // 处理固定保费和费率计算两种模式
      // request函数已经提取了data字段，所以result直接就是data对象
      const premiumPerPerson = result.premium_per_person || 0;
      console.log(`[前端] 提取的每人保费: ${premiumPerPerson}, 保障期限: ${actualDuration}`);
      console.log(`[前端] result对象:`, JSON.stringify(result, null, 2));
      
      // 验证：如果保障期限是1个月，保费应该是月保费（28），如果是1年，应该是年保费（336）
      if (actualDuration.includes('个月') && premiumPerPerson > 100) {
        console.warn(`[前端] ⚠️ 保费可能反了！保障期限是"${actualDuration}"，但保费是${premiumPerPerson}（应该是月保费约28）`);
      }
      if (actualDuration.includes('年') && premiumPerPerson < 100) {
        console.warn(`[前端] ⚠️ 保费可能反了！保障期限是"${actualDuration}"，但保费是${premiumPerPerson}（应该是年保费约336）`);
      }
      
      console.log(`[前端] 更新premiums，planInstanceId: ${planInstanceId}, 保费: ${premiumPerPerson}`);
      
      setPremiums((prev) => {
        const updated = {
          ...prev,
          [planInstanceId]: premiumPerPerson,
        };
        console.log(`[前端] premiums更新前:`, prev);
        console.log(`[前端] premiums更新后:`, updated);
        
        // 同时更新plan中的保费信息
        const plan = plans.find((p) => p.id === planInstanceId);
        if (plan) {
          const count = typeof plan.insuredCount === 'number' ? plan.insuredCount : 0;
          const totalPremium = premiumPerPerson * count;
          setPlans(plans.map((p) => 
            p.id === planInstanceId 
              ? { ...p, premiumPerPerson, totalPremium }
              : p
          ));
        }
        
        return updated;
      });
    } catch (error) {
      console.error('计算保费失败:', error);
      // 显示错误提示
      alert('计算保费失败，请检查方案配置是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 自动重新计算保费：监听所有可能影响保费的因素变化
  useEffect(() => {
    console.log(`[前端] ========== 自动重新计算保费检查 ==========`);
    console.log(`[前端] plans数量: ${plans.length}`);
    console.log(`[前端] selectedPlanIds:`, selectedPlanIds);
    console.log(`[前端] planLiabilities keys:`, Object.keys(planLiabilities));
    
    const timers: NodeJS.Timeout[] = [];
    
    plans.forEach((plan) => {
      const planId = selectedPlanIds[plan.id];
      
      // 必须满足以下条件才计算保费：
      // 1. 已选择方案（planId存在）
      // 2. 已选择产品
      // 3. 有投保人数
      // 4. 责任配置已加载（如果方案有责任的话）
      if (!planId || !selectedProductId) {
        console.log(`[前端] 跳过方案 ${plan.id} - planId: ${planId}, selectedProductId: ${selectedProductId}`);
        return;
      }
      
      if (!plan.insuredCount || plan.insuredCount === '') {
        console.log(`[前端] 跳过方案 ${plan.id} - 投保人数为空`);
        // 清除保费显示
        setPremiums((prev) => {
          if (prev[plan.id] !== undefined) {
            const updated = { ...prev };
            delete updated[plan.id];
            console.log(`[前端] 清除方案 ${plan.id} 的保费（投保人数为空）`);
            return updated;
          }
          return prev;
        });
        return;
      }
      
      // 检查责任配置是否已加载
      const liabilities = planLiabilities[planId] || [];
      if (liabilities.length === 0) {
        console.log(`[前端] 跳过方案 ${plan.id} - 责任配置未加载 (planId: ${planId})`);
        return;
      }
      
      // 检查是否有必要的责任选择
      const requiredLiabilities = liabilities.filter((liability) => liability.is_required);
      console.log(`[前端] 方案 ${plan.id} 的必选责任数量: ${requiredLiabilities.length}`);
      
      if (requiredLiabilities.length > 0) {
        const hasRequiredSelections = requiredLiabilities.every((liability) => {
          const selectedValue = plan.liabilitySelections?.[liability.liability_id];
          const hasSelection = selectedValue && selectedValue !== '';
          if (!hasSelection) {
            console.log(`[前端] 必选责任 ${liability.liability_name} (${liability.liability_id}) 未选择`);
          }
          return hasSelection;
        });
        
        if (!hasRequiredSelections) {
          console.log(`[前端] 跳过方案 ${plan.id} - 必选责任未选择完整`);
          console.log(`[前端] 当前责任选择:`, plan.liabilitySelections);
          console.log(`[前端] 必选责任列表:`, requiredLiabilities.map(l => ({ id: l.liability_id, name: l.liability_name })));
          return;
        }
      } else {
        console.log(`[前端] 方案 ${plan.id} 没有必选责任，继续计算`);
      }
      
      console.log(`[前端] ✅ 触发方案 ${plan.id} 的保费自动计算`);
      console.log(`[前端] 方案信息:`, {
        planId,
        insuredCount: plan.insuredCount,
        duration: plan.duration,
        jobClass: plan.jobClass,
        liabilitySelectionsCount: Object.keys(plan.liabilitySelections || {}).length,
        liabilitiesCount: liabilities.length,
      });
      
      // 使用防抖，避免频繁计算
      const timer = setTimeout(() => {
        handleCalculatePremium(plan.id);
      }, 300);
      
      timers.push(timer);
    });
    
    // 清理函数
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [
    plans,
    selectedPlanIds,
    selectedProductId,
    planLiabilities,
    // 注意：不包含 handleCalculatePremium，使用 useCallback 或直接在 useEffect 内定义
  ]);

  const handleUpdatePlan = (id: string, field: keyof PlanConfig, value: any) => {
    setPlans(plans.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleAddPlan = () => {
    const newId = Date.now().toString();
    const newPlan: PlanConfig = {
      id: newId,
      name: `方案${['一', '二', '三', '四', '五'][plans.length] || plans.length + 1}`,
      jobClass: '1~3类',
      insuredCount: '',
      deathBenefit: '',
      medicalBenefit: '',
      dailyHospital: '',
      lostWages: '',
      duration: '1年', // 默认1年
      paymentType: '一次交清',
      disabilityScale: '',
      accident24h: '不投保',
      applicationType: '新保',
      isHighRisk: false,
      liabilitySelections: {}, // 初始化责任选择为空对象
    };
    setPlans([...plans, newPlan]);
  };

  const handleRemovePlan = (id: string) => {
    if (plans.length > 1) {
      setPlans(plans.filter((p) => p.id !== id));
      const newSelectedPlanIds = { ...selectedPlanIds };
      delete newSelectedPlanIds[id];
      setSelectedPlanIds(newSelectedPlanIds);
    }
  };

  const totalPrice = plans.reduce((sum, plan) => {
    const count = typeof plan.insuredCount === 'number' ? plan.insuredCount : 0;
    const premium = premiums[plan.id] || 0;
    return sum + premium * count;
  }, 0);

  return (
    <div className="space-y-6">
      {/* 产品选择 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4">选择产品</h3>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={selectedProductId || ''}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
        >
          <option value="">请选择产品</option>
          {products.map((product) => (
            <option key={product.product_id} value={product.product_id}>
              {product.product_name} ({product.company_name})
            </option>
          ))}
        </select>
      </div>

      {/* 投保人信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-6">投保人信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex items-center">
            <label className="w-28 text-sm text-gray-600">投保企业名称</label>
            <input
              type="text"
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
            />
          </div>
          <div className="flex items-center">
            <label className="w-32 text-sm text-gray-600">社会统一信用代码</label>
            <input
              type="text"
              className="flex-1 rounded border-gray-300 border px-3 py-2 text-sm"
              value={companyInfo.creditCode}
              onChange={(e) => setCompanyInfo({ ...companyInfo, creditCode: e.target.value })}
            />
          </div>
          
          {/* 企业所在地 - 级联选择器 */}
          <div className="flex flex-col md:col-span-2">
            <label className="w-28 text-sm text-gray-600 mb-2">企业所在地 <span className="text-red-500">*</span></label>
            <RegionCascader
              value={{
                provinceId: companyInfo.provinceId,
                cityId: companyInfo.cityId,
                districtId: companyInfo.districtId,
                province: companyInfo.province,
                city: companyInfo.city,
                district: companyInfo.district,
              }}
              onChange={(value) => {
                setCompanyInfo({
                  ...companyInfo,
                  ...value,
                });
              }}
              deniedRegions={interceptRules.region_restriction?.denied_regions || []}
              placeholder="请选择企业所在地"
            />
          </div>
        </div>
      </div>

      {/* 方案选择 */}
      {selectedProductId && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-800">选择投保方案</h3>
            <button
              onClick={handleAddPlan}
              className="text-blue-600 text-sm border border-blue-400 px-4 py-1.5 rounded hover:bg-blue-50"
            >
              + 增加方案
            </button>
          </div>

          {dataLoading && <div className="text-center py-4">加载中...</div>}

          {availablePlans.length === 0 && !dataLoading && (
            <div className="text-center py-4 text-gray-500">该产品暂无可用方案</div>
          )}

          {availablePlans.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[150px]">
                      配置项
                    </th>
                    {plans.map((plan, index) => {
                      const planId = selectedPlanIds[plan.id];
                      return (
                        <th key={plan.id} className="border border-gray-300 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-700 relative min-w-[200px]">
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                className="border border-gray-300 rounded px-2 py-1 text-xs"
                                value={planId || ''}
                                onChange={(e) => {
                                  const newPlanId = Number(e.target.value);
                                  console.log(`[前端] 方案下拉框变化: planInstanceId=${plan.id}, 旧planId=${planId}, 新planId=${newPlanId}`);
                                  handleSelectPlan(plan.id, newPlanId);
                                }}
                              >
                                <option value="">请选择方案</option>
                                {availablePlans.map((p) => (
                                  <option key={p.plan_id} value={p.plan_id}>
                                    {p.plan_name}
                                  </option>
                                ))}
                              </select>
                              {plans.length > 1 && (
                                <button
                                  onClick={() => handleRemovePlan(plan.id)}
                                  className="text-red-500 text-sm hover:text-red-700"
                                  title="删除方案"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{plan.name}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {plans.length > 0 && (
                    <>
                      {/* 投保类型 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          投保类型
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="border border-gray-300 px-4 py-2">
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                              value="新保"
                              disabled
                              readOnly
                            />
                          </td>
                        ))}
                      </tr>

                      {/* 是否涉高 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          是否涉高
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="border border-gray-300 px-4 py-2">
                            <select
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={plan.isHighRisk ? '是' : '否'}
                              onChange={(e) => {
                                const newValue = e.target.value === '是';
                                console.log(`[前端] 是否涉高变化: 方案 ${plan.id}, 新值: ${newValue}`);
                                handleUpdatePlan(plan.id, 'isHighRisk', newValue);
                                // 是否涉高变化会触发 useEffect 自动重新计算保费
                              }}
                            >
                              <option value="否">否</option>
                              <option value="是">是</option>
                            </select>
                          </td>
                        ))}
                      </tr>

                      {/* 职业类别 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          职业类别
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="border border-gray-300 px-4 py-2">
                            <select
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={plan.jobClass}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                console.log(`[前端] 职业类别变化: 方案 ${plan.id}, 新值: ${newValue}`);
                                handleUpdatePlan(plan.id, 'jobClass', newValue);
                                // 职业类别变化会触发 useEffect 自动重新计算保费
                              }}
                            >
                              <option value="1~3类">1~3类</option>
                              <option value="4类">4类</option>
                              <option value="5类">5类</option>
                            </select>
                          </td>
                        ))}
                      </tr>

                      {/* 保障时间 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          保障时间
                        </td>
                        {plans.map((plan) => {
                          const planId = selectedPlanIds[plan.id];
                          return (
                            <td key={plan.id} className="border border-gray-300 px-4 py-2">
                              <select
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                value={commonDuration}
                                onChange={async (e) => {
                                  const newDuration = e.target.value;
                                  console.log(`[前端] 保障期限切换: ${commonDuration} -> ${newDuration}`);
                                  console.log(`[前端] 所有方案统一更新保障期限为: ${newDuration}`);
                                  
                                  // 更新统一的保障期限
                                  setCommonDuration(newDuration);
                                  
                                  // 统一更新所有方案的保障期限
                                  const updatedPlans = plans.map((p) => {
                                    const updatedPlan = { ...p, duration: newDuration };
                                    // 如果该方案有投保人数，需要重新计算保费
                                    if (p.insuredCount) {
                                      console.log(`[前端] 方案 ${p.id} 需要重新计算保费`);
                                      // 异步计算保费，不阻塞状态更新
                                      setTimeout(() => {
                                        handleCalculatePremium(p.id, newDuration);
                                      }, 0);
                                    }
                                    return updatedPlan;
                                  });
                                  setPlans(updatedPlans);
                                }}
                              >
                                {planId ? (
                                  availablePlans
                                    .find((p) => p.plan_id === planId)
                                    ?.duration_options.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))
                                ) : (
                                  <option value="1年">1年</option>
                                )}
                              </select>
                            </td>
                          );
                        })}
                      </tr>

                      {/* 责任配置 - 动态显示所有方案的责任 */}
                      {(() => {
                        // 收集所有方案的责任，去重并排序
                        const allLiabilities = new Map();
                        plans.forEach((plan) => {
                          const planId = selectedPlanIds[plan.id];
                          if (planId) {
                            const liabilities = planLiabilities[planId] || [];
                            console.log(`[前端] 方案 ${plan.id} (planId: ${planId}) 的责任数量: ${liabilities.length}`);
                            liabilities.forEach((liability) => {
                              if (!allLiabilities.has(liability.liability_id)) {
                                allLiabilities.set(liability.liability_id, liability);
                              }
                            });
                          } else {
                            console.log(`[前端] 方案 ${plan.id} 尚未选择具体方案（planId为空）`);
                          }
                        });
                        
                        console.log(`[前端] 收集到的所有责任数量: ${allLiabilities.size}`);
                        
                        const sortedLiabilities = Array.from(allLiabilities.values()).sort(
                          (a, b) => (a.display_order || 0) - (b.display_order || 0)
                        );

                        // 如果没有责任，显示提示信息
                        if (sortedLiabilities.length === 0) {
                          return (
                            <tr>
                              <td colSpan={plans.length + 1} className="border border-gray-300 px-4 py-8 text-center text-gray-400 text-sm">
                                {plans.some(p => selectedPlanIds[p.id]) 
                                  ? '正在加载责任配置...' 
                                  : '请先选择方案'}
                              </td>
                            </tr>
                          );
                        }

                        return sortedLiabilities.map((liability) => (
                          <tr key={liability.liability_id}>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                              {liability.liability_name}
                              {liability.is_required && <span className="text-red-500 ml-1">*</span>}
                            </td>
                            {plans.map((plan) => {
                              const planId = selectedPlanIds[plan.id];
                              const planLiabilitiesList = planId ? planLiabilities[planId] || [] : [];
                              const planLiability = planLiabilitiesList.find(
                                (l) => l.liability_id === liability.liability_id
                              );
                              const currentValue = plan.liabilitySelections?.[liability.liability_id] || 
                                                   planLiability?.default_coverage || '';

                              return (
                                <td key={plan.id} className="border border-gray-300 px-4 py-2">
                                  {planId && planLiability ? (
                                    <div className="flex items-center gap-1">
                                      <select
                                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                        value={currentValue}
                                        onChange={(e) => {
                                          const newValue = e.target.value;
                                          console.log(`[前端] 责任选择变化: 方案 ${plan.id}, 责任 ${liability.liability_id}, 新值: ${newValue}`);
                                          const newSelections = {
                                            ...(plan.liabilitySelections || {}),
                                            [liability.liability_id]: newValue,
                                          };
                                          handleUpdatePlan(plan.id, 'liabilitySelections', newSelections);
                                          // 责任选择变化会触发 useEffect 自动重新计算保费
                                        }}
                                      >
                                        <option value="">请选择</option>
                                        {planLiability.coverage_options.map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                      {planLiability.unit && (
                                        <span className="text-xs text-gray-500 whitespace-nowrap">{planLiability.unit}</span>
                                      )}
                                    </div>
                                  ) : planId ? (
                                    <span className="text-gray-400 text-xs">加载中...</span>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}

                      {/* 投保人数 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          投保人数
                        </td>
                        {plans.map((plan) => (
                          <td key={plan.id} className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={plan.insuredCount}
                              onChange={(e) => {
                                const newValue = e.target.value === '' ? '' : parseInt(e.target.value);
                                console.log(`[前端] 投保人数变化: 方案 ${plan.id}, 旧值: ${plan.insuredCount}, 新值: ${newValue}`);
                                handleUpdatePlan(
                                  plan.id,
                                  'insuredCount',
                                  newValue
                                );
                                // 投保人数变化会触发 useEffect 自动重新计算保费
                              }}
                              placeholder="请填写投保人数"
                            />
                          </td>
                        ))}
                      </tr>

                      {/* 每人保费 */}
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600 bg-gray-50">
                          每人保费
                        </td>
                        {plans.map((plan) => {
                          const premium = premiums[plan.id];
                          return (
                            <td key={plan.id} className="border border-gray-300 px-4 py-2">
                              {plan.insuredCount ? (
                                premium !== undefined && premium > 0 ? (
                                  <div className="flex flex-col">
                                    <span className="text-red-600 font-bold text-base">
                                      ¥{premium}元
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      (保障期限: {plan.duration})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">计算中...</span>
                                )
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-6 items-center gap-4">
        <div className="text-sm text-gray-600">
          合计支付保费: <span className="text-2xl font-bold text-blue-600 mx-1">{totalPrice}</span>{' '}
          元
        </div>
        <button
          onClick={() => {
            // 校验企业所在地
            if (!validateRegion()) {
              alert('请完整选择企业所在地（省-市-区）');
              return;
            }
            // 校验其他必填项
            if (!companyInfo.name || !companyInfo.name.trim()) {
              alert('请填写投保企业名称');
              return;
            }
            if (!companyInfo.creditCode || !companyInfo.creditCode.trim()) {
              alert('请填写社会统一信用代码');
              return;
            }
            onNext();
          }}
          disabled={!selectedProductId || plans.length === 0}
          className="px-8 py-2.5 bg-blue-500 text-white rounded shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一步
        </button>
      </div>
    </div>
  );
};

export default PlanSelectionDynamic;

