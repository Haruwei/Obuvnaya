using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Controls.Templates;
using Avalonia.Media.Imaging;
using System;

namespace Obuvnaya;

public partial class MainWindow : Window
{
    private readonly DbConnection _db = new();
    private int _roleId = 1;
    private List<Product> _allProducts = new();
    private List<ProductViewModel> _displayProducts = new();
    private List<Supplier> _suppliers = new();
    private bool _sortAsc = true;

    public MainWindow(int roleId)
    {
        InitializeComponent();
        _roleId = roleId;
        SetupRole();
        LoadData();
    }

    private void SetupRole()
    {
        bool isClient = _roleId == 2;
        bool isManager = _roleId == 3;
        bool isAdmin = _roleId == 4;
        bool isGuest = _roleId == 1;

        FilterPanel.IsVisible = isManager || isAdmin;
        
        AddProductBtn.IsVisible = isAdmin;
        
        OrdersBtn.IsVisible = isManager || isAdmin;

        TitleText.Text = _roleId switch
        {
            4 => "ИС Обувь - Администратор",
            3 => "ИС Обувь - Менеджер",
            2 => "ИС Обувь - Каталог",
            _ => "ИС Обувь - Каталог (гость)"
        };

        RoleText.Text = _roleId switch
        {
            4 => "Режим администратора",
            3 => "Режим менеджера",
            2 => "Режим авторизованного клиента",
            _ => "Режим просмотра (гость)"
        };
    }

    private void LoadData()
    {
        try
        {
            _allProducts = _db.GetProducts();
            _suppliers = _db.GetSuppliers();

            var allSuppliers = new List<Supplier> { new Supplier { SupplierId = 0, SupplierName = "Все поставщики" } };
            allSuppliers.AddRange(_suppliers);
            SupplierCombo.ItemsSource = allSuppliers;
            SupplierCombo.SelectedIndex = 0;

            UpdateDisplay();
        }
        catch (Exception ex)
        {
            ShowMessage("Ошибка загрузки данных", ex.Message);
        }
    }

    private void UpdateDisplay()
    {
        _displayProducts = _allProducts.Select(p => new ProductViewModel(p)).ToList();
        ProductsList.ItemsSource = _displayProducts;
    }

    private void OnSearchClick(object? sender, RoutedEventArgs e)
    {
        FilterProducts();
    }

    private void OnResetClick(object? sender, RoutedEventArgs e)
    {
        SearchBox.Text = "";
        SupplierCombo.SelectedIndex = 0;
        LoadData();
    }

    private void OnSortClick(object? sender, RoutedEventArgs e)
    {
        _sortAsc = !_sortAsc;
        SortBtn.Content = _sortAsc ? "Цена ↑" : "Цена ↓";
        FilterProducts();
    }

    private void FilterProducts()
    {
        var search = SearchBox.Text?.Trim();
        var supplier = SupplierCombo.SelectedItem as Supplier;
        int? supplierId = supplier?.SupplierId > 0 ? supplier.SupplierId : null;

        var filtered = _db.GetProducts(search, supplierId);

        filtered = _sortAsc
            ? filtered.OrderBy(p => p.Price).ToList()
            : filtered.OrderByDescending(p => p.Price).ToList();

        _displayProducts = filtered.Select(p => new ProductViewModel(p)).ToList();
        ProductsList.ItemsSource = _displayProducts;
    }

    private void OnProductClick(object? sender, Avalonia.Input.PointerPressedEventArgs e)
    {
        if (sender is not Border border || border.DataContext is not ProductViewModel vm) return;

        var product = _allProducts.FirstOrDefault(p => p.ProductId == vm.ProductId);
        if (product == null) return;

        if (_roleId == 4 && e.ClickCount == 2)
        {
            ShowEditDialog(product);
        }
        else if (_roleId == 4)
        {
            ShowAdminMenu(product);
        }
    }

    private void ShowAdminMenu(Product product)
    {
        var menu = new ContextMenu();

        var editItem = new MenuItem { Header = "Редактировать" };
        editItem.Click += (s, e) => ShowEditDialog(product);

        var deleteItem = new MenuItem { Header = "Удалить" };
        deleteItem.Click += async (s, e) => await DeleteProduct(product);

        menu.Items.Add(editItem);
        menu.Items.Add(deleteItem);
        menu.Open(this);
    }

    private async Task DeleteProduct(Product product)
    {
        var result = await ShowConfirm($"Удалить товар \"{product.ProductName}\"?");
        if (!result) return;

        try
        {
            _db.SoftDeleteProduct(product.ProductId);
            LoadData();
            await ShowMessage("Успешно", "Товар удален");
        }
        catch (Exception ex)
        {
            await ShowMessage("Ошибка", ex.Message);
        }
    }

    private void OnAddProductClick(object? sender, RoutedEventArgs e)
    {
        ShowEditDialog(null);
    }

    private void ShowEditDialog(Product? product)
    {
        var dialog = new ProductEditDialog(_db, product);
        dialog.Closed += (s, e) => LoadData();
        dialog.ShowDialog(this);
    }

    private void OnOrdersClick(object? sender, RoutedEventArgs e)
    {
        new OrdersWindow(_roleId).Show();
    }

    private void OnExitClick(object? sender, RoutedEventArgs e)
    {
        new LoginWindow().Show();
        Close();
    }

    private async Task ShowMessage(string title, string message)
    {
        var dialog = new Window
        {
            Title = title,
            Width = 350,
            Height = 150,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            Content = new StackPanel
            {
                Margin = new Thickness(0, 0, 0, 20),
                Spacing = 15,
                Children =
                {
                    new TextBlock { Text = message, TextWrapping = Avalonia.Media.TextWrapping.Wrap },
                    new Button { Content = "OK", HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Center, Width = 80 }
                }
            }
        };
        ((Button)((StackPanel)dialog.Content).Children[1]).Click += (s, e) => dialog.Close();
        await dialog.ShowDialog(this);
    }

    private async Task<bool> ShowConfirm(string message)
    {
        var tcs = new TaskCompletionSource<bool>();
        var dialog = new Window
        {
            Title = "Подтверждение",
            Width = 350,
            Height = 150,
            WindowStartupLocation = WindowStartupLocation.CenterOwner,
            Content = new StackPanel
            {
                Margin = new Thickness(20),
                Spacing = 15,
                Children =
                {
                    new TextBlock { Text = message, TextWrapping = Avalonia.Media.TextWrapping.Wrap },
                    new StackPanel
                    {
                        Orientation = Avalonia.Layout.Orientation.Horizontal,
                        HorizontalAlignment = Avalonia.Layout.HorizontalAlignment.Right,
                        Spacing = 10,
                        Children =
                        {
                            new Button { Content = "Да", Width = 70, Tag = true },
                            new Button { Content = "Нет", Width = 70, Tag = false }
                        }
                    }
                }
            }
        };

        var buttons = ((StackPanel)((StackPanel)dialog.Content).Children[1]).Children;
        foreach (Button btn in buttons)
        {
            btn.Click += (s, e) =>
            {
                tcs.SetResult(btn.Tag is bool b && b);
                dialog.Close();
            };
        }

        await dialog.ShowDialog(this);
        return await tcs.Task;
    }
}

public class ProductViewModel
{
    public Bitmap? ProductImage { get; }
    public string PhotoPath { get; }
    public int ProductId { get; }
    public string Article { get; }
    public string ProductName { get; }
    public string CategoryName { get; }
    public string Manufacturer { get; }
    public string SupplierName { get; }
    public int ProdQty { get; }
    public decimal FinalPrice { get; }
    public decimal OldPrice { get; }
    public bool HasDiscount { get; }
    public string DiscountText { get; }
    public IBrush DiscountBg { get; }
    public IBrush DiscountCircleBg { get; }

    public ProductViewModel(Product p)
    {
        ProductId = p.ProductId;
        Article = p.Article;
        ProductName = p.ProductName;
        CategoryName = p.CategoryName;
        Manufacturer = p.Manufacturer;
        SupplierName = p.SupplierName;
        ProdQty = p.ProdQty;
        FinalPrice = p.FinalPrice;
        OldPrice = p.OldPrice;
        HasDiscount = p.HasDiscount;
        DiscountText = p.HasDiscount ? $"-{p.DiscountValue:F0}%" : "0%";

        var fileName = string.IsNullOrWhiteSpace(p.Photo) ? "picture.png" : p.Photo.Trim();
        PhotoPath = $"/Resources/{fileName}";

        DiscountBg = p.DiscountValue > 15
            ? new SolidColorBrush(Color.Parse("#2E8B57"))
            : new SolidColorBrush(Colors.White);

        DiscountCircleBg = p.HasDiscount
            ? new SolidColorBrush(Color.Parse("#7FFF00"))
            : new SolidColorBrush(Color.Parse("#9E9E9E"));
    }
}
