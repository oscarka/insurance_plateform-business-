import React, { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Select,
  Button,
  Table,
  Tag,
  message,
  Space,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ImportRecord {
  import_id: number;
  import_type: string;
  file_name: string;
  import_status: string;
  success_count: number;
  fail_count: number;
  imported_at: string;
}

const ConfigImport: React.FC = () => {
  const [importType, setImportType] = useState<string>('');
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);

  const uploadProps: UploadProps = {
    accept: '.yaml,.yml,.json',
    beforeUpload: (file) => {
      if (!importType) {
        message.warning('请先选择导入类型');
        return false;
      }
      handleImport(file);
      return false;
    },
  };

  const handleImport = async (file: File) => {
    try {
      // TODO: 调用API上传和导入
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('import_type', importType);
      // const response = await api.importConfig(formData);
      
      message.success('导入成功');
      fetchImportHistory();
    } catch (error) {
      message.error('导入失败');
    }
  };

  const fetchImportHistory = async () => {
    try {
      // TODO: 调用API获取导入历史
      // const response = await api.getImportHistory();
      // setImportHistory(response.data);
      
      // 模拟数据
      setImportHistory([
        {
          import_id: 1,
          import_type: '产品配置',
          file_name: 'libo_products.yaml',
          import_status: '成功',
          success_count: 10,
          fail_count: 0,
          imported_at: '2025-01-01 10:00:00',
        },
      ]);
    } catch (error) {
      message.error('获取导入历史失败');
    }
  };

  useEffect(() => {
    fetchImportHistory();
  }, []);

  const columns: ColumnsType<ImportRecord> = [
    {
      title: '导入类型',
      dataIndex: 'import_type',
      width: 150,
    },
    {
      title: '文件名',
      dataIndex: 'file_name',
      width: 200,
    },
    {
      title: '导入状态',
      dataIndex: 'import_status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === '成功' ? 'green' : status === '失败' ? 'red' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '成功数量',
      dataIndex: 'success_count',
      width: 100,
    },
    {
      title: '失败数量',
      dataIndex: 'fail_count',
      width: 100,
    },
    {
      title: '导入时间',
      dataIndex: 'imported_at',
      width: 180,
    },
    {
      title: '操作',
      width: 100,
      render: () => (
        <Button type="link">查看详情</Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="配置导入" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Select
              placeholder="选择导入类型"
              style={{ width: 200 }}
              value={importType}
              onChange={setImportType}
            >
              <Select.Option value="产品配置">产品配置</Select.Option>
              <Select.Option value="责任配置">责任配置</Select.Option>
              <Select.Option value="方案配置">方案配置</Select.Option>
              <Select.Option value="费率配置">费率配置</Select.Option>
              <Select.Option value="接口配置">接口配置</Select.Option>
            </Select>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} disabled={!importType}>
                选择文件
              </Button>
            </Upload>
            <span style={{ color: '#999' }}>
              支持格式：YAML、JSON
            </span>
          </Space>
        </Space>
      </Card>

      <Card title="导入历史">
        <Table
          columns={columns}
          dataSource={importHistory}
          rowKey="import_id"
        />
      </Card>
    </div>
  );
};

export default ConfigImport;

