using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace Obuvnaya;

public partial class OrderEditDialog : Window
{
    private readonly DbConnection _db;
    private OrderDetails? _order;
    private List<User> _users = new();
    private List<OrderStatus> _statuses = new();
    private List<DeliveryPoint> _points = new();
    private List<Product> _foundProducts = new();
    private ObservableCollection<OrderItem> _items = new();

    public OrderEditDialog(DbConnection db, OrderDetails? order)
    {
        InitializeComponent();
        _db = db;
        _order = order;

        LoadComboBoxes();
        ItemsGrid.ItemsSource = _items;

        if (order != null)
        {
            TitleBlock.Text = $"Редактирование заказа №{order.OrderId}";

            var items = _db.GetOrderItems(order.OrderId);
            foreach (var item in items)
                _items.Add(item);

            var user = _users.FirstOrDefault(u => u.UserId == order.UserId);
            if (user != null) UserBox.SelectedItem = user;

            var status = _statuses.FirstOrDefault(s => s.StatusId == order.OrderStatus);
            if (status != null) StatusBox.SelectedItem = status;

            var point = _points.FirstOrDefault(p => p.DeliveryPointId == order.DeliveryPointId);
            if (point != null) PointBox.SelectedItem = point;

            CodeBox.Text = order.ReceiveCode;

            if (order.DeliveryDate.HasValue)
                DeliveryDateBox.SelectedDate = new DateTimeOffset(order.DeliveryDate.Value);

            foreach (var item in order.Items)
                _items.Add(item);

            UpdateTotal();
        }
        else
        {
            CodeBox.Text = _db.GenerateReceiveCode();
        }

        SearchProductBox.TextChanged += (s, e) => SearchProducts();
    }

    private void LoadComboBoxes()
    {
        _users = _db.GetUsers();
        _statuses = _db.GetOrderStatuses();
        _points = _db.GetDeliveryPoints();

        UserBox.ItemsSource = _users;
        StatusBox.ItemsSource = _statuses;
        PointBox.ItemsSource = _points;

        if (_statuses.Count > 0) StatusBox.SelectedIndex = 0;
        if (_points.Count > 0) PointBox.SelectedIndex = 0;
        if (_users.Count > 0) UserBox.SelectedIndex = 0;
    }

    private void SearchProducts()
    {
        var search = SearchProductBox.Text?.Trim();
        if (string.IsNullOrEmpty(search) || search.Length < 2)
        {
            _foundProducts.Clear();
            ProductBox.ItemsSource = null;
            return;
        }

        _foundProducts = _db.SearchProducts(search);
        ProductBox.ItemsSource = _foundProducts.Select(p => $"{p.Article} - {p.ProductName}").ToList();
        if (_foundProducts.Count > 0) ProductBox.SelectedIndex = 0;
    }

    private void OnAddProductClick(object? sender, RoutedEventArgs e)
    {
        if (ProductBox.SelectedIndex < 0 || _foundProducts.Count == 0) return;

        var product = _foundProducts[ProductBox.SelectedIndex];
        if (!int.TryParse(QtyBox.Text, out int qty) || qty <= 0)
        {
            ErrorText.Text = "Введите корректное количество";
            return;
        }

        if (product.ProdQty < qty)
        {
            ErrorText.Text = $"Недостаточно товара. Доступно: {product.ProdQty}";
            return;
        }

        var existing = _items.FirstOrDefault(i => i.ProductArticle == product.Article);
        if (existing != null)
        {
            existing.Quantity += qty;
            var index = _items.IndexOf(existing);
            _items[index] = existing;
        }
        else
        {
            _items.Add(new OrderItem
            {
                ProductArticle = product.Article,
                ProductName = product.ProductName,
                Price = product.Price,
                Quantity = qty
            });
        }

        UpdateTotal();
        SearchProductBox.Text = "";
        QtyBox.Text = "1";
        ErrorText.Text = "";
    }

    private void OnRemoveProductClick(object? sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.DataContext is OrderItem item)
        {
            _items.Remove(item);
            UpdateTotal();
        }
    }

    private void UpdateTotal()
    {
        var total = _items.Sum(i => i.Total);
        TotalText.Text = $"{total:N2} ₽";
    }

    private async void OnSaveClick(object? sender, RoutedEventArgs e)
    {
        ErrorText.Text = "";

        if (UserBox.SelectedItem is not User user)
        {
            ErrorText.Text = "Выберите клиента";
            return;
        }

        if (StatusBox.SelectedItem is not OrderStatus status)
        {
            ErrorText.Text = "Выберите статус";
            return;
        }

        if (PointBox.SelectedItem is not DeliveryPoint point)
        {
            ErrorText.Text = "Выберите пункт выдачи";
            return;
        }

        if (_items.Count == 0)
        {
            ErrorText.Text = "Добавьте хотя бы один товар";
            return;
        }

        var order = new OrderDetails
        {
            OrderId = _order?.OrderId ?? 0,
            UserId = user.UserId,
            OrderStatus = status.StatusId,
            DeliveryPointId = point.DeliveryPointId,
            DeliveryDate = DeliveryDateBox.SelectedDate?.DateTime,
            ReceiveCode = CodeBox.Text?.Trim() ?? "",
            Items = _items.ToList()
        };

        try
        {
            if (_order == null)
            {
                await _db.AddOrder(order.UserId, order.DeliveryPointId, order.OrderStatus,
                    order.ReceiveCode, order.DeliveryDate, order.Items.ToList());
            }
            else
            {
                await _db.UpdateOrder(order);
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
