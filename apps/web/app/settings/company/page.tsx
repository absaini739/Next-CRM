'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function CompanyPage() {
    const [companyName, setCompanyName] = useState('ispecia');
    const [industry, setIndustry] = useState('Technology');
    const [website, setWebsite] = useState('https://ispecia.com');
    const [phone, setPhone] = useState('+1 (555) 123-4567');
    const [address, setAddress] = useState('123 Business St, Suite 100');
    const [city, setCity] = useState('San Francisco');
    const [country, setCountry] = useState('United States');
    const [primaryColor, setPrimaryColor] = useState('#3B82F6');

    const industryOptions = [
        { value: 'Technology', label: 'Technology' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Retail', label: 'Retail' },
        { value: 'Manufacturing', label: 'Manufacturing' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500 mb-2">
                        <span className="text-blue-600">Settings</span>
                        <span className="mx-2">/</span>
                        <span>Company Profile</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Company Profile</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 dark:text-slate-400">
                        Update company information and branding
                    </p>
                </div>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Company Information</h3>
                    <div className="space-y-4">
                        <div>
                            <Input
                                label="Company Name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Select
                                    label="Industry"
                                    options={industryOptions}
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Website"
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Input
                                label="Phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <Input
                                label="Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="primary">Save Changes</Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Branding</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Company Logo</label>
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <BuildingOfficeIcon className="h-10 w-10 text-gray-400 dark:text-slate-400" />
                                </div>
                                <Button variant="secondary">Upload Logo</Button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">Primary Color</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                                />
                                <span className="text-sm text-gray-900">{primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
