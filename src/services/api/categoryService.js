import categoryData from '../mockData/categories.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class CategoryService {
  constructor() {
    this.data = [...categoryData];
  }

  async getAll() {
    await delay(200);
    return [...this.data];
  }

  async getById(id) {
    await delay(150);
    const category = this.data.find(category => category.id === id);
    return category ? { ...category } : null;
  }

  async create(category) {
    await delay(300);
    const newCategory = {
      ...category,
      id: Date.now().toString()
    };
    this.data.push(newCategory);
    return { ...newCategory };
  }

  async update(id, updateData) {
    await delay(250);
    const index = this.data.findIndex(category => category.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    this.data[index] = {
      ...this.data[index],
      ...updateData
    };
    
    return { ...this.data[index] };
  }

  async delete(id) {
    await delay(200);
    const index = this.data.findIndex(category => category.id === id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    
    const deletedCategory = this.data.splice(index, 1)[0];
    return { ...deletedCategory };
  }
}

export default new CategoryService();