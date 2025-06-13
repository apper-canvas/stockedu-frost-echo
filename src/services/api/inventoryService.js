import inventoryData from '../mockData/inventory.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class InventoryService {
  constructor() {
    this.data = [...inventoryData];
  }

  async getAll() {
    await delay(300);
    return [...this.data];
  }

  async getById(id) {
    await delay(200);
    const item = this.data.find(item => item.id === id);
    return item ? { ...item } : null;
  }

  async create(item) {
    await delay(400);
    const newItem = {
      ...item,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    this.data.push(newItem);
    return { ...newItem };
  }

  async update(id, updateData) {
    await delay(300);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...updateData,
      lastUpdated: new Date().toISOString()
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(250);
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const deletedItem = this.data.splice(index, 1)[0];
    return { ...deletedItem };
  }

  async getLowStockItems() {
    await delay(200);
    return this.data.filter(item => item.quantity <= item.minQuantity).map(item => ({ ...item }));
  }

  async searchByName(query) {
    await delay(250);
    const lowercaseQuery = query.toLowerCase();
    return this.data
      .filter(item => 
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery) ||
        item.location.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item }));
  }

  async getByCategory(category) {
    await delay(200);
    return this.data
      .filter(item => item.category === category)
      .map(item => ({ ...item }));
  }
}

export default new InventoryService();