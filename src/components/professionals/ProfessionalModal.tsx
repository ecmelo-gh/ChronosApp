import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Upload, Space, TimePicker, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { Professional } from '@/hooks/useProfessionals';

interface ProfessionalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (professional: Omit<Professional, 'id' | 'created_at' | 'organization_id'>) => Promise<void>;
  onUploadAvatar?: (id: string, file: File) => Promise<string | null>;
  professional?: Professional;
  specialties: string[];
}

const DAYS_OF_WEEK = [
  { label: 'Domingo', value: '0' },
  { label: 'Segunda', value: '1' },
  { label: 'Terça', value: '2' },
  { label: 'Quarta', value: '3' },
  { label: 'Quinta', value: '4' },
  { label: 'Sexta', value: '5' },
  { label: 'Sábado', value: '6' },
];

const getBase64 = (img: RcFile): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(img);
  });
};

export function ProfessionalModal({
  open,
  onClose,
  onSave,
  onUploadAvatar,
  professional,
  specialties,
}: ProfessionalModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  useEffect(() => {
    if (open && professional) {
      form.setFieldsValue({
        ...professional,
        working_hours: Object.entries(professional.working_hours || {}).map(
          ([day, hours]) => ({
            day,
            ...hours,
          })
        ),
      });
      setImageUrl(professional.avatar_url);
    } else {
      form.resetFields();
      setImageUrl(undefined);
    }
  }, [open, professional, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Transformar working_hours de array para objeto
      const working_hours = values.working_hours?.reduce(
        (acc: Professional['working_hours'], curr: any) => {
          if (curr.day && curr.start && curr.end) {
            acc[curr.day] = {
              start: curr.start,
              end: curr.end,
              break_start: curr.break_start,
              break_end: curr.break_end,
            };
          }
          return acc;
        },
        {}
      );

      await onSave({
        ...values,
        working_hours,
      });

      message.success(
        professional ? 'Profissional atualizado com sucesso!' : 'Profissional criado com sucesso!'
      );
      onClose();
    } catch (err) {
      console.error('Error saving professional:', err);
      message.error('Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialty = (value: string) => {
    if (value && !specialties.includes(value)) {
      setNewSpecialty('');
      return value;
    }
    return undefined;
  };

  const handleUpload = async (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }

    if (info.file.status === 'done') {
      try {
        const base64Url = await getBase64(info.file.originFileObj as RcFile);
        setImageUrl(base64Url);
        setUploadLoading(false);

        if (professional?.id && onUploadAvatar) {
          const url = await onUploadAvatar(
            professional.id,
            info.file.originFileObj as File
          );
          if (url) {
            setImageUrl(url);
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
        message.error('Erro ao processar imagem');
      }
    }
  };

  const uploadButton = (
    <div>
      {uploadLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      open={open}
      title={professional ? 'Editar Profissional' : 'Novo Profissional'}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          active: true,
          commission_rate: 50,
          working_hours: [],
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Form.Item
              name="name"
              label="Nome"
              rules={[{ required: true, message: 'Informe o nome' }]}
            >
              <Input placeholder="Nome completo" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Informe o email' },
                { type: 'email', message: 'Email inválido' },
              ]}
            >
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone"
              rules={[{ required: true, message: 'Informe o telefone' }]}
            >
              <Input placeholder="(00) 00000-0000" />
            </Form.Item>

            <Form.Item
              name="commission_rate"
              label="Comissão (%)"
              rules={[{ required: true, message: 'Informe a comissão' }]}
            >
              <InputNumber
                min={0}
                max={100}
                className="w-full"
                placeholder="Porcentagem de comissão"
              />
            </Form.Item>
          </div>

          <div>
            <Form.Item label="Foto">
              <Upload
                name="avatar"
                listType="picture-card"
                showUploadList={false}
                action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                onChange={handleUpload}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>

            <Form.Item
              name="specialties"
              label="Especialidades"
              rules={[{ required: true, message: 'Selecione ao menos uma especialidade' }]}
            >
              <Select
                mode="multiple"
                placeholder="Selecione as especialidades"
                options={specialties.map((spec) => ({ label: spec, value: spec }))}
                onSearch={setNewSpecialty}
                onSelect={handleAddSpecialty}
                notFoundContent={
                  newSpecialty ? (
                    <div className="p-2 text-sm text-gray-600">
                      Pressione Enter para adicionar "{newSpecialty}"
                    </div>
                  ) : null
                }
              />
            </Form.Item>

            <Form.Item
              name="bio"
              label="Biografia"
            >
              <Input.TextArea
                rows={4}
                placeholder="Uma breve descrição sobre o profissional"
              />
            </Form.Item>
          </div>
        </div>

        <Form.List name="working_hours">
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Horários de Trabalho</h3>
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  Adicionar Horário
                </Button>
              </div>

              {fields.map((field, index) => (
                <Space key={field.key} align="baseline">
                  <Form.Item
                    {...field}
                    name={[field.name, 'day']}
                    rules={[{ required: true, message: 'Selecione o dia' }]}
                  >
                    <Select
                      style={{ width: 120 }}
                      options={DAYS_OF_WEEK}
                      placeholder="Dia"
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'start']}
                    rules={[{ required: true, message: 'Horário inicial' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="Início" />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'end']}
                    rules={[{ required: true, message: 'Horário final' }]}
                  >
                    <TimePicker format="HH:mm" placeholder="Fim" />
                  </Form.Item>

                  <Form.Item {...field} name={[field.name, 'break_start']}>
                    <TimePicker format="HH:mm" placeholder="Início intervalo" />
                  </Form.Item>

                  <Form.Item {...field} name={[field.name, 'break_end']}>
                    <TimePicker format="HH:mm" placeholder="Fim intervalo" />
                  </Form.Item>

                  <Button onClick={() => remove(index)} type="text" danger>
                    Remover
                  </Button>
                </Space>
              ))}
            </div>
          )}
        </Form.List>

        <Form.Item
          name="active"
          label="Ativo"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
