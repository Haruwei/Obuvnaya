using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Obuvnaya;

public partial class ProductEditDialog : Window
{
    private readonly DbConnection _db;
    private Product? _product;
    private List<Category> _categories = new();
    private List<Supplier> _suppliers = new();

    public ProductEditDialog(DbConnection db, Product? product)
    {
        InitializeComponent();
        _db = db;
        _product = product;

        LoadComboBoxes();

        if (product != null)
        {
            TitleBlock.Text = "Редактирование товара";
            ArticleBox.Text = product.Article;
            NameBox.Text = product.ProductName;
            PriceBox.Text = product.Price.ToString();
            QtyBox.Text = product.ProdQty.ToString();
            DiscountBox.Text = (product.Discount ?? 0).ToString();
            ManufacturerBox.Text = product.Manufacturer;
            MeasureBox.Text = product.Measure;
            DescBox.Text = product.Description;
            PhotoBox.Text = product.Photo;

            var cat = _categories.FirstOrDefault(c => c.CategoryId == product.CategoryId);
            if (cat != null) CategoryBox.SelectedItem = cat;

            var sup = _suppliers.FirstOrDefault(s => s.SupplierId == product.SupplierId);
            if (sup != null) SupplierBox.SelectedItem = sup;
        }
    }

    private void LoadComboBoxes()
    {
        _categories = _db.GetCategories();
        _suppliers = _db.GetSuppliers();

        CategoryBox.ItemsSource = _categories;
        SupplierBox.ItemsSource = _suppliers;

        if (_categories.Count > 0) CategoryBox.SelectedIndex = 0;
        if (_suppliers.Count > 0) SupplierBox.SelectedIndex = 0;
    }

    private async void OnSaveClick(object? sender, RoutedEventArgs e)
    {
        ErrorText.Text = "";

        if (string.IsNullOrWhiteSpace(ArticleBox.Text))
        {
            ErrorText.Text = "Введите артикул";
            return;
        }

        if (string.IsNullOrWhiteSpace(NameBox.Text))
        {
            ErrorText.Text = "Введите название";
            return;
        }

        if (!decimal.TryParse(PriceBox.Text, out decimal price) || price <= 0)
        {
            ErrorText.Text = "Введите корректную цену";
            return;
        }

        if (CategoryBox.SelectedItem is not Category category)
        {
            ErrorText.Text = "Выберите категорию";
            return;
        }

        var supplier = SupplierBox.SelectedItem as Supplier;
        int.TryParse(QtyBox.Text, out int qty);
        decimal.TryParse(DiscountBox.Text, out decimal discount);

        var product = new Product
        {
            ProductId = _product?.ProductId ?? 0,
            Article = ArticleBox.Text.Trim(),
            ProductName = NameBox.Text.Trim(),
            Price = price,
            ProdQty = qty,
            Discount = discount > 0 ? discount : null,
            Manufacturer = ManufacturerBox.Text?.Trim() ?? "",
            Measure = MeasureBox.Text?.Trim() ?? "шт.",
            Description = DescBox.Text?.Trim() ?? "",
            Photo = PhotoBox.Text?.Trim() ?? "picture.png",
            CategoryId = category.CategoryId,
            SupplierId = supplier?.SupplierId ?? 0
        };

        try
        {
            if (_product == null)
            {
                await _db.AddProduct(product);
            }
            else
            {
                await _db.UpdateProduct(product);
            }
            Close();
        }
        catch (Exception ex)
        {
            ErrorText.Text = $"Ошибка сохранения: {ex.Message}";
        }
    }

    private void OnCancelClick(object? sender, RoutedEventArgs e)
    {
        Close();
    }
}
