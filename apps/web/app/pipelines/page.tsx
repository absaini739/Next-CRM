'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import { toast } from 'sonner';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function PipelinesManagementPage() {
    const [pipelines, setPipelines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPipeline, setEditingPipeline] = useState<any>(null);
    const [pipelineName, setPipelineName] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [stages, setStages] = useState<string[]>(['New', 'Contacted', 'Qualified']);

    useEffect(() => {
        fetchPipelines();
    }, []);

    const fetchPipelines = async () => {
        try {
            const response = await api.get('/pipelines');
            setPipelines(response.data);
        } catch (error) {
            toast.error('Failed to load pipelines');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePipeline = async () => {
        try {
            const payload = {
                name: pipelineName,
                is_default: isDefault,
                stages: stages.map((name, index) => ({ name, sort_order: index }))
            };

            if (editingPipeline) {
                await api.put(`/pipelines/${editingPipeline.id}`, payload);
                toast.success('Pipeline updated successfully');
            } else {
                await api.post('/pipelines', payload);
                toast.success('Pipeline created successfully');
            }

            setModalOpen(false);
            resetForm();
            fetchPipelines();
        } catch (error) {
            toast.error('Failed to save pipeline');
        }
    };

    const handleDeletePipeline = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pipeline?')) return;

        try {
            await api.delete(`/pipelines/${id}`);
            toast.success('Pipeline deleted successfully');
            fetchPipelines();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete pipeline');
        }
    };

    const openEditModal = (pipeline: any) => {
        setEditingPipeline(pipeline);
        setPipelineName(pipeline.name);
        setIsDefault(pipeline.is_default);
        setStages(pipeline.stages?.map((s: any) => s.name) || []);
        setModalOpen(true);
    };

    const resetForm = () => {
        setEditingPipeline(null);
        setPipelineName('');
        setIsDefault(false);
        setStages(['New', 'Contacted', 'Qualified']);
    };

    const addStage = () => {
        setStages([...stages, '']);
    };

    const updateStage = (index: number, value: string) => {
        const newStages = [...stages];
        newStages[index] = value;
        setStages(newStages);
    };

    const removeStage = (index: number) => {
        setStages(stages.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600 dark:text-slate-400">Loading pipelines...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Pipeline Management</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                            Manage your sales pipelines and stages
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => {
                            resetForm();
                            setModalOpen(true);
                        }}
                        className="flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Pipeline
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pipelines.map((pipeline) => (
                        <Card key={pipeline.id}>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 dark:text-slate-100">{pipeline.name}</h3>
                                        {pipeline.is_default && (
                                            <Badge variant="info" size="sm" className="mt-1">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(pipeline)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        {!pipeline.is_default && (
                                            <button
                                                onClick={() => handleDeletePipeline(pipeline.id)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Stages:</p>
                                    <div className="space-y-1">
                                        {pipeline.stages?.map((stage: any, index: number) => (
                                            <div key={stage.id} className="flex items-center text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                                                <span className="w-6 text-gray-400 dark:text-slate-400">{index + 1}.</span>
                                                <span>{stage.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Create/Edit Modal */}
                <Modal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        resetForm();
                    }}
                    title={editingPipeline ? 'Edit Pipeline' : 'Create Pipeline'}
                    size="lg"
                >
                    <div className="space-y-4">
                        <Input
                            label="Pipeline Name"
                            value={pipelineName}
                            onChange={(e) => setPipelineName(e.target.value)}
                            placeholder="e.g., Sales Pipeline"
                        />

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={isDefault}
                                onChange={(e) => setIsDefault(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="isDefault" className="text-sm text-gray-700">
                                Set as default pipeline
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Stages</label>
                            {stages.map((stage, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-slate-500 w-8">{index + 1}.</span>
                                    <Input
                                        value={stage}
                                        onChange={(e) => updateStage(index, e.target.value)}
                                        placeholder="Stage name"
                                        className="flex-1"
                                    />
                                    {stages.length > 1 && (
                                        <button
                                            onClick={() => removeStage(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <Button variant="secondary" size="sm" onClick={addStage} className="mt-2">
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Stage
                            </Button>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setModalOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleCreatePipeline}>
                                {editingPipeline ? 'Update' : 'Create'} Pipeline
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
