import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, BuildingIcon, EditIcon, TrashIcon, XIcon } from 'lucide-react';
import { AppLayout } from './AppLayout';
import { useCRUD } from '../hooks/useCRUD';

interface Partner {
  id: string;
  name: string;
  description?: string;
  year_established?: number;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  areas_of_expertise?: string[];
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  created_by?: string;
}

export const PartnersPage: React.FC = () => {
  const { data, list, create, update, remove, loading } = useCRUD<Partner>('partners');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    year_established: '',
    website: '',
    email: '',
    phone: '',
    location: '',
    areas_of_expertise: [] as string[],
    logo_url: '',
  });
  const [expertiseInput, setExpertiseInput] = useState('');

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    await list();
  };
  
  // Update partners when data changes
  useEffect(() => {
    if (data) {
      setPartners(data);
    }
  }, [data]);

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        description: partner.description || '',
        year_established: partner.year_established?.toString() || '',
        website: partner.website || '',
        email: partner.email || '',
        phone: partner.phone || '',
        location: partner.location || '',
        areas_of_expertise: partner.areas_of_expertise || [],
        logo_url: partner.logo_url || '',
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: '',
        description: '',
        year_established: '',
        website: '',
        email: '',
        phone: '',
        location: '',
        areas_of_expertise: [],
        logo_url: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPartner(null);
    setExpertiseInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const partnerData = {
      name: formData.name,
      description: formData.description || undefined,
      year_established: formData.year_established ? parseInt(formData.year_established) : undefined,
      website: formData.website || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      location: formData.location || undefined,
      areas_of_expertise: formData.areas_of_expertise.length > 0 ? formData.areas_of_expertise : undefined,
      logo_url: formData.logo_url || undefined,
      is_active: true,
    };

    if (editingPartner) {
      await update(editingPartner.id, partnerData);
    } else {
      await create(partnerData);
    }

    handleCloseModal();
    loadPartners();
  };

  const addExpertise = () => {
    if (expertiseInput.trim() && !formData.areas_of_expertise.includes(expertiseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        areas_of_expertise: [...prev.areas_of_expertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (item: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.filter(e => e !== item)
    }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      await remove(id);
      loadPartners();
    }
  };

  



  return (
    <AppLayout activeSection="partners">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
            <p className="text-gray-600">Manage service providers and partners</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Add Partner
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BuildingIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first partner.</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="w-5 h-5" />
              Add Partner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                      {partner.year_established && (
                        <p className="text-sm text-gray-500">Est. {partner.year_established}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(partner)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {partner.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.description}</p>
                )}

                {partner.areas_of_expertise && partner.areas_of_expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {partner.areas_of_expertise.slice(0, 3).map((area, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {area}
                      </span>
                    ))}
                    {partner.areas_of_expertise.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{partner.areas_of_expertise.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-500 space-y-1">
                  {partner.location && <p>📍 {partner.location}</p>}
                  {partner.email && <p>✉️ {partner.email}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseModal}></div>
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-semibold">
                    {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Established</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.year_established}
                        onChange={(e) => setFormData(prev => ({ ...prev, year_established: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Areas of Expertise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                        placeholder="Add expertise area"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={addExpertise}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.areas_of_expertise.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {item}
                          <button type="button" onClick={() => removeExpertise(item)} className="hover:text-blue-900">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingPartner ? 'Update Partner' : 'Create Partner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PartnersPage;
