import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, DatePicker, Select, Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { createSprint, getSprintById, updateSprint } from '@/services/api';
import { SPRINT_STATUSES } from '@/constants';
import { calcDays } from '@/utils/helpers';
import dayjs from 'dayjs';
import type { Sprint } from '@/types';

interface FormValues {
  name: string;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  status: Sprint['status'];
}

const SprintForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', startDate: null, endDate: null, status: 'Planning' },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      getSprintById(id).then(s => {
        if (s) {
          setValue('name', s.name);
          setValue('startDate', dayjs(s.startDate));
          setValue('endDate', dayjs(s.endDate));
          setValue('status', s.status);
        }
      });
    }
  }, [id]);

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const lengthDays = startDate && endDate ? calcDays(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')) : 0;

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const payload = {
      name: data.name,
      startDate: data.startDate!.format('YYYY-MM-DD'),
      endDate: data.endDate!.format('YYYY-MM-DD'),
      status: data.status,
      lengthDays,
    };
    if (isEdit) await updateSprint(id, payload);
    else await createSprint(payload);
    message.success(isEdit ? 'Sprint updated' : 'Sprint created');
    navigate('/sprints');
    setLoading(false);
  };

  return (
    <div className="max-w-xl">
      <PageHeader title={isEdit ? 'Edit Sprint' : 'Create Sprint'} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sprint Name</label>
          <Controller name="name" control={control} rules={{ required: 'Required' }} render={({ field }) => <Input {...field} placeholder="e.g., Sprint Mar 26 – Apr 25" />} />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Controller name="startDate" control={control} rules={{ required: 'Required' }} render={({ field }) => <DatePicker {...field} className="w-full" />} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Controller name="endDate" control={control} rules={{ required: 'Required' }} render={({ field }) => <DatePicker {...field} className="w-full" />} />
          </div>
        </div>
        {lengthDays > 0 && <p className="text-sm text-muted-foreground">Sprint length: <strong>{lengthDays} days</strong></p>}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Controller name="status" control={control} render={({ field }) => <Select {...field} className="w-full" options={SPRINT_STATUSES.map(s => ({ value: s, label: s }))} />} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="primary" htmlType="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Sprint'}</Button>
          <Button onClick={() => navigate('/sprints')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default SprintForm;
