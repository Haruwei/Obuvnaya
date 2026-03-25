#!/usr/bin/env node

/**
 * Avalonia CLI - Генератор файлов для проекта "ИС Обувь"
 * 
 * Использование: node avalonia-cli.js <номер>
 * 
 * Команды:
 *   1  - Базовая структура (Program.cs, App.axaml, App.axaml.cs)
 *   2  - Модели и подключение к БД (Models.cs, DbConnection.cs)
 *   3  - Окно входа (LoginWindow.axaml, LoginWindow.axaml.cs)
 *   4  - Главное окно (MainWindow.axaml, MainWindow.axaml.cs)
 *   5  - Окно заказов (OrdersWindow.axaml, OrdersWindow.axaml.cs)
 *   6  - Диалог заказа (OrderEditDialog.axaml, OrderEditDialog.axaml.cs)
 *   7  - Диалог товара (ProductEditDialog.axaml, ProductEditDialog.axaml.cs)
 *   8  - Проектный файл (.csproj)
 *   9  - Полный проект (всё сразу)
 *   0  - Справка
 */

const fs = require('fs');
const path = require('path');

const command = process.argv[2];

if (!command || command === '0' || command === '--help' || command === '-h' || command === 'help') {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║              🥾 Avalonia CLI - ИС Обувь v1.0               ║
╚════════════════════════════════════════════════════════════╝

Использование: node avalonia-cli.js <номер>

Доступные команды:
  ┌─────┬────────────────────────────────────────────────────┐
  │  1  │ Базовая структура                                  │
  │     │ • Program.cs                                       │
  │     │ • App.axaml                                        │
  │     │ • App.axaml.cs                                     │
  ├─────┼────────────────────────────────────────────────────┤
  │  2  │ Модели и подключение к БД                          │
  │     │ • Models.cs                                        │
  │     │ • DbConnection.cs                                  │
  ├─────┼────────────────────────────────────────────────────┤
  │  3  │ Окно входа                                         │
  │     │ • LoginWindow.axaml                                │
  │     │ • LoginWindow.axaml.cs                             │
  ├─────┼────────────────────────────────────────────────────┤
  │  4  │ Главное окно (каталог товаров)                     │
  │     │ • MainWindow.axaml                                 │
  │     │ • MainWindow.axaml.cs                              │
  ├─────┼────────────────────────────────────────────────────┤
  │  5  │ Окно заказов                                       │
  │     │ • OrdersWindow.axaml                               │
  │     │ • OrdersWindow.axaml.cs                            │
  ├─────┼────────────────────────────────────────────────────┤
  │  6  │ Диалог редактирования заказа                       │
  │     │ • OrderEditDialog.axaml                            │
  │     │ • OrderEditDialog.axaml.cs                         │
  ├─────┼────────────────────────────────────────────────────┤
  │  7  │ Диалог редактирования товара                       │
  │     │ • ProductEditDialog.axaml                          │
  │     │ • ProductEditDialog.axaml.cs                       │
  ├─────┼────────────────────────────────────────────────────┤
  │  8  │ Проектный файл                                     │
  │     │ • Obuvnaya.csproj                                  │
  ├─────┼────────────────────────────────────────────────────┤
  │  9  │ Полный проект (всё сразу)                          │
  │     │ Создаёт все файлы и папки                          │
  └─────┴────────────────────────────────────────────────────┘

Примеры:
  node avalonia-cli.js 1      # Создать базовую структуру
  node avalonia-cli.js 4      # Создать главное окно
  node avalonia-cli.js 9      # Создать полный проект
`);
    process.exit(0);
}

// Шаблоны файлов
const templates = {
    // 1. Базовая структура
    'Program.cs': `using Avalonia;
using System;

namespace Obuvnaya;

class Program
{
    [STAThread]
    public static void Main(string[] args) => BuildAvaloniaApp()
        .StartWithClassicDesktopLifetime(args);

    public static AppBuilder BuildAvaloniaApp()
        => AppBuilder.Configure<App>()
            .UsePlatformDetect()
            .WithInterFont()
            .LogToTrace();
}
`,

    'App.axaml': `<Application xmlns="https://github.com/avaloniaui"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             x:Class="Obuvnaya.App"
             RequestedThemeVariant="Default">

  <Application.Styles>
    <FluentTheme />
    <StyleInclude Source="avares://Avalonia.Controls.DataGrid/Themes/Fluent.xaml" />

    <Style Selector="Window">
      <Setter Property="Background" Value="#FFFFFF" />
      <Setter Property="FontFamily" Value="Times New Roman" />
      <Setter Property="FontSize" Value="14" />
    </Style>

    <Style Selector="Button">
      <Setter Property="Background" Value="#7FFF00" />
      <Setter Property="Foreground" Value="Black" />
    </Style>
  </Application.Styles>
</Application>
`,

    'App.axaml.cs': `using Avalonia;
using Avalonia.Controls.ApplicationLifetimes;
using Avalonia.Markup.Xaml;

namespace Obuvnaya;

public partial class App : Application
{
    public override void Initialize()
    {
        AvaloniaXamlLoader.Load(this);
    }

    public override void OnFrameworkInitializationCompleted()
    {
        if (ApplicationLifetime is IClassicDesktopStyleApplicationLifetime desktop)
        {
            desktop.MainWindow = new LoginWindow();
        }
        base.OnFrameworkInitializationCompleted();
    }
}
`,

    // 2. Модели и БД
    'Models.cs': `using Avalonia.Media.Imaging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Obuvnaya;

public class Product
{
    public int ProductId { get; set; }
    public string Article { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Measure { get; set; } = "шт.";
    public decimal Price { get; set; }
    public decimal? Discount { get; set; }
    public int ProdQty { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = "Не указан";
    public string Manufacturer { get; set; } = "Не указан";
    public string Description { get; set; } = string.Empty;
    public string Photo { get; set; } = "picture.png";
    public bool IsDeleted { get; set; }

    public decimal DiscountValue => Discount ?? 0m;
    public bool HasDiscount => Discount.HasValue && Discount.Value > 0;
    public decimal OldPrice => HasDiscount ? Math.Round(Price / (1 - Discount!.Value / 100m)) : 0;
    public decimal FinalPrice => HasDiscount ? Price : Price;

    public string DisplayName => $"{Article} - {ProductName}";
}

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public override string ToString() => CategoryName;
}

public class Supplier
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public override string ToString() => SupplierName;
}

public class OrderDetails
{
    public int OrderId { get; set; }
    public DateTime OrderDate { get; set; }
    public int OrderStatus { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserLogin { get; set; } = string.Empty;
    public int DeliveryPointId { get; set; }
    public string DeliveryPointAddress { get; set; } = string.Empty;
    public DateTime? DeliveryDate { get; set; }
    public string ReceiveCode { get; set; } = string.Empty;
    public List<OrderItem> Items { get; set; } = new();

    public int ItemsCount => Items.Count;
    public decimal TotalAmount => Items.Sum(i => i.Total);
    public string DisplayDate => OrderDate.ToString("dd.MM.yyyy HH:mm");
    public string DeliveryDateDisplay => DeliveryDate?.ToString("dd.MM.yyyy") ?? "Не указана";
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public string ProductArticle { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total => Price * Quantity;
}

public class OrderStatus
{
    public int StatusId { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public override string ToString() => StatusName;
}

public class DeliveryPoint
{
    public int DeliveryPointId { get; set; }
    public string Address { get; set; } = string.Empty;
    public override string ToString() => Address;
}

public class User
{
    public int UserId { get; set; }
    public string Login { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? Surname { get; set; }
    public string RoleName { get; set; } = string.Empty;

    public string FullName => $"{LastName} {FirstName} {Surname}".Trim();
    public override string ToString() => $"{FullName} ({Login})";
}
`,

    'DbConnection.cs': `using Npgsql;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Obuvnaya;

public class DbConnection
{
    private readonly string _connectionString =
        "Host=localhost;Port=5432;Database=serbeevobuv1;Username=postgres;Password=123456;";
    private readonly string _logFile = "database_errors.log";

    public NpgsqlConnection GetConnection() => new(_connectionString);

    private void LogToFile(string message)
    {
        try
        {
            var logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}\\n";
            File.AppendAllText(_logFile, logEntry);
        }
        catch { }
    }

    public (int userId, int roleId) Authenticate(string login, string password)
    {
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand(
                "SELECT user_id, role_id FROM users WHERE login = @l AND password = @p", conn);
            cmd.Parameters.AddWithValue("l", login);
            cmd.Parameters.AddWithValue("p", password);
            using var r = cmd.ExecuteReader();
            return r.Read() ? (r.GetInt32(0), r.GetInt32(1)) : (-1, -1);
        }
        catch (Exception ex)
        {
            LogToFile($"AUTH_ERROR: {ex.Message}");
            throw;
        }
    }

    public List<Product> GetProducts(string? search = null, int? supplierId = null)
    {
        var list = new List<Product>();
        using var conn = GetConnection();
        try
        {
            conn.Open();

            var conditions = new List<string> { "p.is_deleted = false" };
            var parameters = new List<NpgsqlParameter>();

            if (!string.IsNullOrEmpty(search))
            {
                conditions.Add("(p.product_name ILIKE @search OR p.article ILIKE @search)");
                parameters.Add(new NpgsqlParameter("search", $"%{search}%"));
            }

            if (supplierId.HasValue)
            {
                conditions.Add("p.supplier_id = @supplier");
                parameters.Add(new NpgsqlParameter("supplier", supplierId.Value));
            }

            var whereClause = string.Join(" AND ", conditions);

            var sql = $@"
            SELECT p.product_id, p.article, p.product_name, p.measure, p.price, 
                p.discount, p.prod_qty, c.category_name, p.category_id, 
                p.photo, p.manufacturer, p.supplier_id, s.supplier_name, p.description
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
            WHERE {whereClause}
            ORDER BY p.product_name";

            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddRange(parameters.ToArray());

            using var r = cmd.ExecuteReader();
            while (r.Read())
            {
                list.Add(new Product
                {
                    ProductId = r.GetInt32(0),
                    Article = r.GetString(1),
                    ProductName = r.GetString(2),
                    Measure = r.IsDBNull(3) ? "шт." : r.GetString(3),
                    Price = r.GetDecimal(4),
                    Discount = r.IsDBNull(5) ? null : r.GetDecimal(5),
                    ProdQty = r.GetInt32(6),
                    CategoryName = r.GetString(7),
                    CategoryId = r.GetInt32(8),
                    Photo = r.IsDBNull(9) ? "picture.png" : r.GetString(9).Trim(),
                    Manufacturer = r.IsDBNull(10) ? "Не указан" : r.GetString(10),
                    SupplierId = r.IsDBNull(11) ? 0 : r.GetInt32(11),
                    SupplierName = r.IsDBNull(12) ? "Не указан" : r.GetString(12),
                    Description = r.IsDBNull(13) ? "" : r.GetString(13)
                });
            }
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_PRODUCTS_ERROR: {ex.Message}");
            throw;
        }
    }

    public List<Category> GetCategories()
    {
        var list = new List<Category>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand("SELECT category_id, category_name FROM categories ORDER BY category_name", conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                list.Add(new Category { CategoryId = r.GetInt32(0), CategoryName = r.GetString(1) });
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_CATEGORIES_ERROR: {ex.Message}");
            return list;
        }
    }

    public List<Supplier> GetSuppliers()
    {
        var list = new List<Supplier>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand("SELECT supplier_id, supplier_name FROM suppliers ORDER BY supplier_name", conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                list.Add(new Supplier { SupplierId = r.GetInt32(0), SupplierName = r.GetString(1) });
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_SUPPLIERS_ERROR: {ex.Message}");
            return list;
        }
    }

    public async Task AddProduct(Product product)
    {
        using var conn = GetConnection();
        await conn.OpenAsync();
        var sql = @"
            INSERT INTO products (article, product_name, measure, price, prod_qty, discount, 
                manufacturer, category_id, supplier_id, description, photo, is_deleted)
            VALUES (@article, @name, @measure, @price, @qty, @discount, 
                @manufacturer, @categoryId, @supplierId, @description, @photo, false)";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("article", product.Article);
        cmd.Parameters.AddWithValue("name", product.ProductName);
        cmd.Parameters.AddWithValue("measure", product.Measure);
        cmd.Parameters.AddWithValue("price", product.Price);
        cmd.Parameters.AddWithValue("qty", product.ProdQty);
        cmd.Parameters.AddWithValue("discount", product.Discount ?? 0);
        cmd.Parameters.AddWithValue("manufacturer", product.Manufacturer);
        cmd.Parameters.AddWithValue("categoryId", product.CategoryId);
        cmd.Parameters.AddWithValue("supplierId", product.SupplierId);
        cmd.Parameters.AddWithValue("description", product.Description);
        cmd.Parameters.AddWithValue("photo", product.Photo);
        await cmd.ExecuteNonQueryAsync();
        LogToFile($"ADD_PRODUCT: {product.ProductName}");
    }

    public async Task UpdateProduct(Product product)
    {
        using var conn = GetConnection();
        await conn.OpenAsync();
        var sql = @"
            UPDATE products SET article = @article, product_name = @name, measure = @measure,
                price = @price, prod_qty = @qty, discount = @discount, manufacturer = @manufacturer,
                category_id = @categoryId, supplier_id = @supplierId, description = @description, photo = @photo
            WHERE product_id = @id";
        using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("id", product.ProductId);
        cmd.Parameters.AddWithValue("article", product.Article);
        cmd.Parameters.AddWithValue("name", product.ProductName);
        cmd.Parameters.AddWithValue("measure", product.Measure);
        cmd.Parameters.AddWithValue("price", product.Price);
        cmd.Parameters.AddWithValue("qty", product.ProdQty);
        cmd.Parameters.AddWithValue("discount", product.Discount ?? 0);
        cmd.Parameters.AddWithValue("manufacturer", product.Manufacturer);
        cmd.Parameters.AddWithValue("categoryId", product.CategoryId);
        cmd.Parameters.AddWithValue("supplierId", product.SupplierId);
        cmd.Parameters.AddWithValue("description", product.Description);
        cmd.Parameters.AddWithValue("photo", product.Photo);
        await cmd.ExecuteNonQueryAsync();
        LogToFile($"UPDATE_PRODUCT: ID={product.ProductId}");
    }

    public void SoftDeleteProduct(int id)
    {
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand("UPDATE products SET is_deleted = true WHERE product_id = @id", conn);
            cmd.Parameters.AddWithValue("id", id);
            cmd.ExecuteNonQuery();
            LogToFile($"SOFT_DELETE_PRODUCT: ID={id}");
        }
        catch (Exception ex)
        {
            LogToFile($"DELETE_PRODUCT_ERROR: {ex.Message}");
            throw;
        }
    }

    public List<OrderDetails> GetOrders()
    {
        var list = new List<OrderDetails>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            var sql = @"
                SELECT o.order_id, o.order_date, os.status_name, u.login, dp.point_address,
                    o.delivery_date, o.order_status, o.user_id, o.delivery_point_id, o.receive_code
                FROM orders o
                JOIN order_statuses os ON o.order_status = os.status_id
                JOIN users u ON o.user_id = u.user_id
                JOIN delivery_points dp ON o.delivery_point_id = dp.delivery_point_id
                WHERE o.is_deleted = false
                ORDER BY o.order_date DESC";
            using var cmd = new NpgsqlCommand(sql, conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
            {
                list.Add(new OrderDetails
                {
                    OrderId = r.GetInt32(0),
                    OrderDate = r.GetDateTime(1),
                    StatusName = r.GetString(2),
                    UserLogin = r.GetString(3),
                    DeliveryPointAddress = r.GetString(4),
                    DeliveryDate = r.IsDBNull(5) ? null : r.GetDateTime(5),
                    OrderStatus = r.GetInt32(6),
                    UserId = r.GetInt32(7),
                    DeliveryPointId = r.GetInt32(8),
                    ReceiveCode = r.IsDBNull(9) ? "" : r.GetString(9)
                });
            }
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_ORDERS_ERROR: {ex.Message}");
            return list;
        }
    }

    public List<OrderStatus> GetOrderStatuses()
    {
        var list = new List<OrderStatus>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand("SELECT status_id, status_name FROM order_statuses ORDER BY status_id", conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                list.Add(new OrderStatus { StatusId = r.GetInt32(0), StatusName = r.GetString(1) });
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_STATUSES_ERROR: {ex.Message}");
            return list;
        }
    }

    public List<DeliveryPoint> GetDeliveryPoints()
    {
        var list = new List<DeliveryPoint>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand("SELECT delivery_point_id, point_address FROM delivery_points ORDER BY point_address", conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
                list.Add(new DeliveryPoint { DeliveryPointId = r.GetInt32(0), Address = r.GetString(1) });
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_POINTS_ERROR: {ex.Message}");
            return list;
        }
    }

    public List<User> GetUsers()
    {
        var list = new List<User>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            var sql = @"
                SELECT u.user_id, u.login, u.last_name, u.first_name, u.surname, r.role_name
                FROM users u
                JOIN roles r ON u.role_id = r.role_id
                ORDER BY u.last_name, u.first_name";
            using var cmd = new NpgsqlCommand(sql, conn);
            using var r = cmd.ExecuteReader();
            while (r.Read())
            {
                list.Add(new User
                {
                    UserId = r.GetInt32(0),
                    Login = r.GetString(1),
                    LastName = r.GetString(2),
                    FirstName = r.GetString(3),
                    Surname = r.IsDBNull(4) ? null : r.GetString(4),
                    RoleName = r.GetString(5)
                });
            }
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_USERS_ERROR: {ex.Message}");
            return list;
        }
    }

    public List<OrderItem> GetOrderItems(int orderId)
    {
        var list = new List<OrderItem>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            var sql = @"
                SELECT oi.order_item_id, oi.product_article, oi.qty, p.price, p.product_name
                FROM order_items oi
                LEFT JOIN products p ON p.article = oi.product_article
                WHERE oi.order_id = @orderId";
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("orderId", orderId);
            using var r = cmd.ExecuteReader();
            while (r.Read())
            {
                list.Add(new OrderItem
                {
                    OrderItemId = r.GetInt32(0),
                    ProductArticle = r.GetString(1),
                    Quantity = r.GetInt32(2),
                    Price = r.IsDBNull(3) ? 0 : r.GetDecimal(3),
                    ProductName = r.IsDBNull(4) ? "Товар удален" : r.GetString(4)
                });
            }
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"GET_ITEMS_ERROR: {ex.Message}");
            return list;
        }
    }

    public async Task<int> AddOrder(int userId, int deliveryPointId, int statusId, string? receiveCode, DateTime? deliveryDate, List<OrderItem> items)
    {
        using var conn = GetConnection();
        await conn.OpenAsync();
        using var transaction = await conn.BeginTransactionAsync();
        try
        {
            var orderSql = @"
                INSERT INTO orders (user_id, delivery_point_id, order_status, receive_code, delivery_date, order_date)
                VALUES (@userId, @pointId, @statusId, @code, @deliveryDate, CURRENT_TIMESTAMP)
                RETURNING order_id";
            using var orderCmd = new NpgsqlCommand(orderSql, conn, transaction);
            orderCmd.Parameters.AddWithValue("userId", userId);
            orderCmd.Parameters.AddWithValue("pointId", deliveryPointId);
            orderCmd.Parameters.AddWithValue("statusId", statusId);
            orderCmd.Parameters.AddWithValue("code", receiveCode ?? (object)DBNull.Value);
            orderCmd.Parameters.AddWithValue("deliveryDate", deliveryDate ?? (object)DBNull.Value);
            var orderId = (int)await orderCmd.ExecuteScalarAsync();

            foreach (var item in items)
            {
                var itemSql = "INSERT INTO order_items (order_id, product_article, qty) VALUES (@orderId, @article, @qty)";
                using var itemCmd = new NpgsqlCommand(itemSql, conn, transaction);
                itemCmd.Parameters.AddWithValue("orderId", orderId);
                itemCmd.Parameters.AddWithValue("article", item.ProductArticle);
                itemCmd.Parameters.AddWithValue("qty", item.Quantity);
                await itemCmd.ExecuteNonQueryAsync();
            }
            await transaction.CommitAsync();
            LogToFile($"ADD_ORDER: ID={orderId}");
            return orderId;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogToFile($"ADD_ORDER_ERROR: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateOrder(OrderDetails order)
    {
        using var conn = GetConnection();
        await conn.OpenAsync();
        using var transaction = await conn.BeginTransactionAsync();
        try
        {
            var sql = @"
                UPDATE orders SET order_status = @statusId, delivery_point_id = @pointId,
                    receive_code = @code, delivery_date = @deliveryDate
                WHERE order_id = @orderId";
            using var cmd = new NpgsqlCommand(sql, conn, transaction);
            cmd.Parameters.AddWithValue("orderId", order.OrderId);
            cmd.Parameters.AddWithValue("statusId", order.OrderStatus);
            cmd.Parameters.AddWithValue("pointId", order.DeliveryPointId);
            cmd.Parameters.AddWithValue("code", order.ReceiveCode ?? (object)DBNull.Value);
            cmd.Parameters.AddWithValue("deliveryDate", order.DeliveryDate ?? (object)DBNull.Value);
            await cmd.ExecuteNonQueryAsync();

            using var delCmd = new NpgsqlCommand("DELETE FROM order_items WHERE order_id = @orderId", conn, transaction);
            delCmd.Parameters.AddWithValue("orderId", order.OrderId);
            await delCmd.ExecuteNonQueryAsync();

            foreach (var item in order.Items)
            {
                var itemSql = "INSERT INTO order_items (order_id, product_article, qty) VALUES (@orderId, @article, @qty)";
                using var itemCmd = new NpgsqlCommand(itemSql, conn, transaction);
                itemCmd.Parameters.AddWithValue("orderId", order.OrderId);
                itemCmd.Parameters.AddWithValue("article", item.ProductArticle);
                itemCmd.Parameters.AddWithValue("qty", item.Quantity);
                await itemCmd.ExecuteNonQueryAsync();
            }
            await transaction.CommitAsync();
            LogToFile($"UPDATE_ORDER: ID={order.OrderId}");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogToFile($"UPDATE_ORDER_ERROR: {ex.Message}");
            throw;
        }
    }

    public async Task DeleteOrder(int orderId)
    {
        using var conn = GetConnection();
        await conn.OpenAsync();
        using var transaction = await conn.BeginTransactionAsync();
        try
        {
            using var delItemsCmd = new NpgsqlCommand("DELETE FROM order_items WHERE order_id = @orderId", conn, transaction);
            delItemsCmd.Parameters.AddWithValue("orderId", orderId);
            await delItemsCmd.ExecuteNonQueryAsync();

            using var delOrderCmd = new NpgsqlCommand("DELETE FROM orders WHERE order_id = @orderId", conn, transaction);
            delOrderCmd.Parameters.AddWithValue("orderId", orderId);
            await delOrderCmd.ExecuteNonQueryAsync();

            await transaction.CommitAsync();
            LogToFile($"DELETE_ORDER: ID={orderId}");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            LogToFile($"DELETE_ORDER_ERROR: {ex.Message}");
            throw;
        }
    }

    public List<Product> SearchProducts(string search)
    {
        var list = new List<Product>();
        using var conn = GetConnection();
        try
        {
            conn.Open();
            var sql = @"
                SELECT p.article, p.product_name, p.price, p.prod_qty
                FROM products p
                WHERE (p.article ILIKE '%' || @search || '%' OR p.product_name ILIKE '%' || @search || '%')
                AND p.is_deleted = false
                ORDER BY p.product_name
                LIMIT 20";
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("search", search);
            using var r = cmd.ExecuteReader();
            while (r.Read())
            {
                list.Add(new Product
                {
                    Article = r.GetString(0),
                    ProductName = r.GetString(1),
                    Price = r.GetDecimal(2),
                    ProdQty = r.GetInt32(3)
                });
            }
            return list;
        }
        catch (Exception ex)
        {
            LogToFile($"SEARCH_ERROR: {ex.Message}");
            return list;
        }
    }
    
    public string GenerateReceiveCode()
    {
        using var conn = GetConnection();
        try
        {
            conn.Open();
            using var cmd = new NpgsqlCommand(@"
                SELECT COALESCE(MAX(NULLIF(regexp_replace(receive_code, '\\D', '', 'g'), '')::int), 900) + 1
                FROM orders 
                WHERE receive_code ~ '^\\d+$'", conn);
            
            var result = cmd.ExecuteScalar();
            return result?.ToString() ?? "901";
        }
        catch
        {
            return "901";
        }
    }
}
`,

    // 3. LoginWindow
    'LoginWindow.axaml': `<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Obuvnaya.LoginWindow"
        Title="ИС Обувь - Вход в систему"
        Width="400"
        Height="500"
        CanResize="False"
        Icon="/Resources/Icon.png"
        WindowStartupLocation="CenterScreen">

    <StackPanel Margin="30" Spacing="20" VerticalAlignment="Center" HorizontalAlignment="Center" Width="320">

        <StackPanel Orientation="Horizontal" Spacing="15" HorizontalAlignment="Center" Margin="0,0,0,20">
            <Image Source="/Resources/Icon.png" Width="50" Height="50"/>
            <TextBlock Text="ИС Обувь" FontSize="28" FontWeight="Bold" VerticalAlignment="Center"/>
        </StackPanel>

        <TextBlock Text="Вход в систему" FontSize="18" HorizontalAlignment="Center" Margin="0,0,0,10"/>

        <TextBox x:Name="LoginBox" Watermark="Логин" Height="40"/>

        <TextBox x:Name="PasswordBox" Watermark="Пароль" PasswordChar="*" Height="40"/>

        <TextBlock x:Name="ErrorText" Foreground="Red" TextWrapping="Wrap" HorizontalAlignment="Center"/>

        <Button Content="Войти" Click="OnLoginClick" HorizontalAlignment="Stretch" Height="40" Background="#00FA9A"/>

        <Button Content="Войти как гость" Click="OnGuestClick" HorizontalAlignment="Stretch" Height="40"/>

    </StackPanel>
</Window>
`,

    'LoginWindow.axaml.cs': `using Avalonia.Controls;
using Avalonia.Interactivity;
using System;
using System.IO;

namespace Obuvnaya;

public partial class LoginWindow : Window
{
    private readonly DbConnection _db = new();

    public LoginWindow()
    {
        InitializeComponent();
    }

    private void OnLoginClick(object? sender, RoutedEventArgs e)
    {
        var login = LoginBox.Text?.Trim();
        var password = PasswordBox.Text?.Trim();

        if (string.IsNullOrEmpty(login) || string.IsNullOrEmpty(password))
        {
            ErrorText.Text = "Введите логин и пароль";
            return;
        }

        try
        {
            var (userId, roleId) = _db.Authenticate(login, password);

            if (userId == -1)
            {
                return;
            }
            new MainWindow(roleId).Show();
            Close();
        }
        catch
        {

        }
    }

    private void OnGuestClick(object? sender, RoutedEventArgs e)
    {
        new MainWindow(1).Show();
        Close();
    }
}
`,

    // 4. MainWindow
    'MainWindow.axaml': `<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Obuvnaya.MainWindow"
        Title="ИС Обувь - Каталог товаров"
        Width="1200"
        Height="800"
        MinWidth="1000"
        MinHeight="600"
        WindowStartupLocation="CenterScreen"
        Icon="/Resources/Icon.png">
 
    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Orientation="Horizontal" HorizontalAlignment="Center" Margin="20,15">
            <Image Source="/Resources/Icon.png" Width="50" Height="50" Margin="0,0,15,0"/>
            <StackPanel VerticalAlignment="Center">
                <TextBlock x:Name="TitleText" Text="ИС Обувь" FontSize="24" FontWeight="Bold"/>
                <TextBlock x:Name="RoleText" Text="Каталог товаров" FontSize="12" Foreground="#666"/>
            </StackPanel>
        </StackPanel>

        <StackPanel x:Name="FilterPanel" Grid.Row="1" Orientation="Horizontal" Spacing="10" Margin="20,0,20,15" IsVisible="False">
            <TextBox x:Name="SearchBox" Width="250" Watermark="Поиск по названию или артикулу" Height="35"/>
            <ComboBox x:Name="SupplierCombo" Width="200" PlaceholderText="Все поставщики" Height="35"/>
            <Button Content="Найти" Click="OnSearchClick" Height="35" Background="#00FA9A"/>
            <Button Content="Сбросить" Click="OnResetClick" Height="35"/>
            <Button x:Name="SortBtn" Content="Цена ↑" Click="OnSortClick" Height="35"/>
        </StackPanel>

        <ScrollViewer Grid.Row="2" VerticalScrollBarVisibility="Auto">
            <ItemsControl x:Name="ProductsList" Margin="20,0">
                <ItemsControl.ItemsPanel>
                    <ItemsPanelTemplate>
                        <StackPanel Orientation="Vertical" Spacing="10"/>
                    </ItemsPanelTemplate>
                </ItemsControl.ItemsPanel>

                <ItemsControl.ItemTemplate>
                    <DataTemplate>
                        <Border Background="{Binding DiscountBg}" CornerRadius="8" BorderThickness="1" BorderBrush="#E0E0E0" Padding="15" PointerPressed="OnProductClick">
                            <Grid>
                                <Grid.ColumnDefinitions>
                                    <ColumnDefinition Width="150"/>
                                    <ColumnDefinition Width="*"/>
                                    <ColumnDefinition Width="100"/>
                                </Grid.ColumnDefinitions>

                                <Border Grid.Column="0" Background="#F5F5F5" CornerRadius="4" Width="130" Height="130">
                                    <Image Source="{Binding PhotoPath}" Stretch="Uniform" Margin="10"/>
                                </Border>

                                <StackPanel Grid.Column="1" Margin="20,0,0,0" VerticalAlignment="Center">
                                    <TextBlock Text="{Binding CategoryName}" FontSize="11" Foreground="#666"/>
                                    <TextBlock Text="{Binding ProductName}" FontSize="18" FontWeight="Bold" Margin="0,2,0,5"/>
                                    <TextBlock Text="{Binding Article}" FontSize="12" Foreground="#666" Margin="0,0,0,10"/>

                                    <StackPanel Orientation="Horizontal" Spacing="25">
                                        <StackPanel>
                                            <TextBlock Text="Производитель:" FontSize="10" Foreground="#666"/>
                                            <TextBlock Text="{Binding Manufacturer}" Foreground="Black"/>
                                        </StackPanel>
                                        <StackPanel>
                                            <TextBlock Text="Поставщик:" FontSize="10" Foreground="#666"/>
                                            <TextBlock Text="{Binding SupplierName}" FontSize="13"/>
                                        </StackPanel>
                                        <StackPanel>
                                            <TextBlock Text="На складе:" FontSize="10" Foreground="#666"/>
                                            <TextBlock Text="{Binding ProdQty, StringFormat='{}{0} шт.'}" FontSize="13" FontWeight="SemiBold"/>
                                        </StackPanel>
                                    </StackPanel>

                                    <StackPanel Orientation="Horizontal" Spacing="15" Margin="0,15,0,0">
                                        <TextBlock Text="{Binding FinalPrice, StringFormat='{}{0} ₽'}" FontSize="22" FontWeight="Bold" Foreground="#1976D2"/>
                                        <TextBlock Text="{Binding OldPrice, StringFormat='{}{0} ₽'}" FontSize="16" Foreground="Red" TextDecorations="Strikethrough" IsVisible="{Binding HasDiscount}" VerticalAlignment="Bottom"/>
                                    </StackPanel>
                                </StackPanel>

                                <Border Grid.Column="2" Width="80" Height="80" CornerRadius="40" Background="{Binding DiscountCircleBg}" VerticalAlignment="Center" HorizontalAlignment="Center">
                                    <TextBlock Text="{Binding DiscountText}" Foreground="White" FontWeight="Bold" FontSize="18" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                                </Border>
                            </Grid>
                        </Border>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </ScrollViewer>

        <StackPanel Grid.Row="3" Orientation="Horizontal" HorizontalAlignment="Right" Margin="20" Spacing="10">
            <Button x:Name="AddProductBtn" Content="Добавить товар" Click="OnAddProductClick" IsVisible="False" Background="#00FA9A"/>
            <Button x:Name="OrdersBtn" Content="Заказы" Click="OnOrdersClick" IsVisible="False" Background="#00FA9A"/>
            <Button Content="Выход" Click="OnExitClick"/>
        </StackPanel>
    </Grid>
</Window>
`,

    'MainWindow.axaml.cs': `using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Avalonia.Media.Imaging;

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
`,

    // 5. OrdersWindow
    'OrdersWindow.axaml': `<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Obuvnaya.OrdersWindow"
        Title="ИС Обувь - Заказы"
        Width="1000"
        Height="700"
        WindowStartupLocation="CenterOwner"
        Icon="/Resources/Icon.png">

    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Orientation="Horizontal" Spacing="10" HorizontalAlignment="Left">
            <Image Source="/Resources/Icon.png" Width="40" Height="40"/>
            <StackPanel VerticalAlignment="Center">
                <TextBlock Text="Управление заказами" FontSize="20" FontWeight="Bold"/>
                <TextBlock x:Name="RoleText" FontSize="11" Foreground="#666"/>
            </StackPanel>
        </StackPanel>

        <StackPanel Grid.Row="1" Orientation="Horizontal" Spacing="10" HorizontalAlignment="Right" Margin="0,0,0,15">
            <Button x:Name="AddOrderBtn" Content="Добавить заказ" Click="OnAddOrderClick" Background="#00FA9A" IsVisible="False"/>
            <Button Content="Обновить" Click="OnRefreshClick"/>
            <Button Content="Закрыть" Click="OnCloseClick"/>
        </StackPanel>

        <ScrollViewer Grid.Row="2" VerticalScrollBarVisibility="Auto">
            <ItemsControl x:Name="OrdersList">
                <ItemsControl.ItemsPanel>
                    <ItemsPanelTemplate>
                        <StackPanel Orientation="Vertical" Spacing="10"/>
                    </ItemsPanelTemplate>
                </ItemsControl.ItemsPanel>

                <ItemsControl.ItemTemplate>
                    <DataTemplate>
                        <Border Background="White" CornerRadius="5" BorderThickness="1" BorderBrush="#E0E0E0" Padding="15" PointerPressed="OnOrderClick">
                            <Grid>
                                <Grid.ColumnDefinitions>
                                    <ColumnDefinition Width="*"/>
                                    <ColumnDefinition Width="Auto"/>
                                </Grid.ColumnDefinitions>

                                <StackPanel Grid.Column="0" Spacing="5">
                                    <StackPanel Orientation="Horizontal" Spacing="5">
                                        <TextBlock Text="Заказ №" FontSize="11" Foreground="#666"/>
                                        <TextBlock Text="{Binding OrderId}" FontSize="14" FontWeight="Bold"/>
                                    </StackPanel>

                                    <StackPanel Orientation="Horizontal" Spacing="5">
                                        <TextBlock Text="Статус:" FontSize="11" Foreground="#666"/>
                                        <TextBlock Text="{Binding StatusName}" FontSize="12" FontWeight="SemiBold"/>
                                    </StackPanel>

                                    <StackPanel Spacing="2">
                                        <TextBlock Text="Пункт выдачи:" FontSize="11" Foreground="#666"/>
                                        <TextBlock Text="{Binding DeliveryPointAddress}" FontSize="12"/>
                                    </StackPanel>

                                    <StackPanel Orientation="Horizontal" Spacing="5">
                                        <TextBlock Text="Дата заказа:" FontSize="11" Foreground="#666"/>
                                        <TextBlock Text="{Binding DisplayDate}" FontSize="12"/>
                                    </StackPanel>
                                </StackPanel>

                                <StackPanel Grid.Column="1" VerticalAlignment="Center" HorizontalAlignment="Center" Margin="20,0,0,0">
                                    <TextBlock Text="Дата доставки" FontSize="11" Foreground="#666" HorizontalAlignment="Center"/>
                                    <TextBlock Text="{Binding DeliveryDateDisplay}" FontSize="16" FontWeight="Bold" Foreground="#1976D2" HorizontalAlignment="Center"/>
                                </StackPanel>
                            </Grid>
                        </Border>
                    </DataTemplate>
                </ItemsControl.ItemTemplate>
            </ItemsControl>
        </ScrollViewer>
    </Grid>
</Window>
`,

    'OrdersWindow.axaml.cs': `using Avalonia;
using Avalonia.Controls;
using Avalonia.Interactivity;
using Avalonia.Layout;
using Avalonia.Media;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Obuvnaya;

public partial class OrdersWindow : Window
{
    private readonly DbConnection _db = new();
    private int _roleId;
    private List<OrderDetails> _orders = new();
    private OrderDetails? _selectedOrder;
    private CancellationTokenSource? _menuCts;

    public OrdersWindow(int roleId)
    {
        InitializeComponent();
        _roleId = roleId;

        AddOrderBtn.IsVisible = _roleId == 4;
        
        RoleText.Text = _roleId switch
        {
            4 => "Режим администратора",
            3 => "Режим менеджера",
            2 => "Режим авторизованного клиента",
            _ => "Режим просмотра (гость)"
        };

        LoadOrders();
    }

    private void LoadOrders()
    {
        try
        {
            _orders = _db.GetOrders();
            OrdersList.ItemsSource = _orders;
        }
        catch (Exception ex)
        {
            ShowMessage("Ошибка", ex.Message);
        }
    }

    private void OnOrderClick(object? sender, Avalonia.Input.PointerPressedEventArgs e)
    {
        if (sender is not Border border || border.DataContext is not OrderDetails order) return;

        _selectedOrder = order;

        if (_roleId != 4) return;

        if (e.ClickCount == 2)
        {
            ShowEditDialog(order);
        }
        else if (e.ClickCount == 1)
        {
            ShowAdminMenu(border, order);
        }
    }

    private void ShowAdminMenu(Border border, OrderDetails order)
    {
        _menuCts?.Cancel();
        _menuCts = new CancellationTokenSource();

        var menu = new ContextMenu();

        var editItem = new MenuItem { Header = "Редактировать" };
        editItem.Click += (s, e) => 
        {
            _menuCts?.Cancel();
            ShowEditDialog(order);
        };

        var deleteItem = new MenuItem { Header = "Удалить" };
        deleteItem.Click += async (s, e) => 
        {
            _menuCts?.Cancel();
            await DeleteOrder(order);
        };

        menu.Items.Add(editItem);
        menu.Items.Add(deleteItem);
        menu.Open(border);

        var token = _menuCts.Token;
        Task.Run(async () =>
        {
            try
            {
                await Task.Delay(5000, token);
                await Avalonia.Threading.Dispatcher.UIThread.InvokeAsync(() =>
                {
                    if (!token.IsCancellationRequested)
                    {
                        menu.Close();
                    }
                });
            }
            catch (OperationCanceledException)
            {
            }
        });
    }

    private void ShowEditDialog(OrderDetails order)
    {
        var dialog = new OrderEditDialog(_db, order);
        dialog.Closed += (s, e) => LoadOrders();
        dialog.ShowDialog(this);
    }

    private async Task DeleteOrder(OrderDetails order)
    {
        var confirm = await ShowConfirm($"Удалить заказ №{order.OrderId}?");
        if (!confirm) return;

        try
        {
            await _db.DeleteOrder(order.OrderId);
            LoadOrders();
            await ShowMessage("Успешно", "Заказ удален");
        }
        catch (Exception ex)
        {
            await ShowMessage("Ошибка", ex.Message);
        }
    }

    private void OnAddOrderClick(object? sender, RoutedEventArgs e)
    {
        ShowEditDialog(null!);
    }

    private void OnRefreshClick(object? sender, RoutedEventArgs e)
    {
        LoadOrders();
    }

    private void OnCloseClick(object? sender, RoutedEventArgs e)
    {
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
                Margin = new Thickness(20),
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
`,

    // 6. OrderEditDialog
    'OrderEditDialog.axaml': `<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Obuvnaya.OrderEditDialog"
        Title="Редактирование заказа"
        Width="700"
        Height="600"
        WindowStartupLocation="CenterOwner"
        Icon="/Resources/Icon.png">

    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <StackPanel Grid.Row="0" Orientation="Horizontal" Spacing="10" Margin="0,0,0,20">
            <Image Source="/Resources/Icon.png" Width="35" Height="35"/>
            <TextBlock x:Name="TitleBlock" Text="Новый заказ" FontSize="18" FontWeight="Bold" VerticalAlignment="Center"/>
        </StackPanel>

        <Grid Grid.Row="1" Margin="0,0,0,15">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>

            <StackPanel Grid.Column="0" Spacing="10" Margin="0,0,10,0">
                <StackPanel>
                    <TextBlock Text="Клиент *:" FontSize="11" Foreground="#666"/>
                    <ComboBox x:Name="UserBox" Height="35"/>
                </StackPanel>

                <StackPanel>
                    <TextBlock Text="Статус *:" FontSize="11" Foreground="#666"/>
                    <ComboBox x:Name="StatusBox" Height="35"/>
                </StackPanel>

                <StackPanel>
                    <TextBlock Text="Дата доставки:" FontSize="11" Foreground="#666"/>
                    <DatePicker x:Name="DeliveryDateBox"/>
                </StackPanel>
            </StackPanel>

            <StackPanel Grid.Column="1" Spacing="10" Margin="10,0,0,0">
                <StackPanel>
                    <TextBlock Text="Пункт выдачи *:" FontSize="11" Foreground="#666"/>
                    <ComboBox x:Name="PointBox" Height="35"/>
                </StackPanel>

                <StackPanel>
                    <TextBlock Text="Код получения:" FontSize="11" Foreground="#666"/>
                    <TextBox x:Name="CodeBox" Height="35"/>
                </StackPanel>

                <StackPanel>
                    <TextBlock Text="Сумма заказа:" FontSize="11" Foreground="#666"/>
                    <TextBlock x:Name="TotalText" Text="0 ₽" FontSize="18" FontWeight="Bold" Foreground="#1976D2"/>
                </StackPanel>
            </StackPanel>
        </Grid>

        <Border Grid.Row="2" Background="#F8F9FA" CornerRadius="5" Padding="15" Margin="0,0,0,15">
            <Grid>
                <Grid.RowDefinitions>
                    <RowDefinition Height="Auto"/>
                    <RowDefinition Height="*"/>
                </Grid.RowDefinitions>

                <StackPanel Grid.Row="0" Orientation="Horizontal" Spacing="10" Margin="0,0,0,10">
                    <TextBox x:Name="SearchProductBox" Width="200" Watermark="Поиск товара" Height="35"/>
                    <ComboBox x:Name="ProductBox" Width="250" Height="35"/>
                    <TextBox x:Name="QtyBox" Width="60" Text="1" Height="35"/>
                    <Button Content="Добавить" Click="OnAddProductClick" Background="#00FA9A"/>
                </StackPanel>

                <DataGrid Grid.Row="1" x:Name="ItemsGrid" AutoGenerateColumns="False" IsReadOnly="True">
                    <DataGrid.Columns>
                        <DataGridTextColumn Header="Артикул" Binding="{Binding ProductArticle}" Width="100"/>
                        <DataGridTextColumn Header="Товар" Binding="{Binding ProductName}" Width="*"/>
                        <DataGridTextColumn Header="Цена" Binding="{Binding Price, StringFormat='{}{0:N2} ₽'}" Width="100"/>
                        <DataGridTextColumn Header="Кол-во" Binding="{Binding Quantity}" Width="80"/>
                        <DataGridTextColumn Header="Сумма" Binding="{Binding Total, StringFormat='{}{0:N2} ₽'}" Width="100"/>
                        <DataGridTemplateColumn Width="50">
                            <DataGridTemplateColumn.CellTemplate>
                                <DataTemplate>
                                    <Button Content="×" Click="OnRemoveProductClick" Background="Transparent" Foreground="Red" FontSize="16"/>
                                </DataTemplate>
                            </DataGridTemplateColumn.CellTemplate>
                        </DataGridTemplateColumn>
                    </DataGrid.Columns>
                </DataGrid>
            </Grid>
        </Border>

        <StackPanel Grid.Row="3" Orientation="Horizontal" HorizontalAlignment="Right" Spacing="10">
            <TextBlock x:Name="ErrorText" Foreground="Red" VerticalAlignment="Center" Margin="0,0,20,0"/>
            <Button Content="Сохранить" Click="OnSaveClick" Width="100" Background="#00FA9A"/>
            <Button Content="Отмена" Click="OnCancelClick" Width="100"/>
        </StackPanel>
    </Grid>
</Window>
`,

    'OrderEditDialog.axaml.cs': `using Avalonia.Controls;
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
`,

    // 7. ProductEditDialog
    'ProductEditDialog.axaml': `<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        x:Class="Obuvnaya.ProductEditDialog"
        Title="Редактирование товара"
        Width="450"
        Height="600"
        WindowStartupLocation="CenterOwner"
        CanResize="False"
        Icon="/Resources/Icon.png">

    <ScrollViewer>
        <StackPanel Margin="25" Spacing="12">
            <TextBlock x:Name="TitleBlock" Text="Новый товар" FontSize="18" FontWeight="Bold" HorizontalAlignment="Center" Margin="0,0,0,15"/>

            <TextBlock Text="Артикул *:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="ArticleBox" Height="35"/>

            <TextBlock Text="Название *:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="NameBox" Height="35"/>

            <TextBlock Text="Категория *:" FontSize="11" Foreground="#666"/>
            <ComboBox x:Name="CategoryBox" Height="35"/>

            <TextBlock Text="Цена *:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="PriceBox" Height="35"/>

            <TextBlock Text="Поставщик:" FontSize="11" Foreground="#666"/>
            <ComboBox x:Name="SupplierBox" Height="35"/>

            <TextBlock Text="Производитель:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="ManufacturerBox" Height="35"/>

            <TextBlock Text="Количество:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="QtyBox" Text="0" Height="35"/>

            <TextBlock Text="Скидка %:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="DiscountBox" Text="0" Height="35"/>

            <TextBlock Text="Ед. измерения:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="MeasureBox" Text="шт." Height="35"/>

            <TextBlock Text="Описание:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="DescBox" AcceptsReturn="True" Height="60"/>

            <TextBlock Text="Фото:" FontSize="11" Foreground="#666"/>
            <TextBox x:Name="PhotoBox" Text="picture.png" Height="35"/>

            <TextBlock x:Name="ErrorText" Foreground="Red" TextWrapping="Wrap"/>

            <StackPanel Orientation="Horizontal" HorizontalAlignment="Right" Spacing="10" Margin="0,15,0,0">
                <Button Content="Сохранить" Click="OnSaveClick" Width="100" Background="#00FA9A"/>
                <Button Content="Отмена" Click="OnCancelClick" Width="100"/>
            </StackPanel>
        </StackPanel>
    </ScrollViewer>
</Window>
`,

    'ProductEditDialog.axaml.cs': `using Avalonia.Controls;
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
`,

    // 8. .csproj
    'Obuvnaya.csproj': `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <BuiltInComHost>false</BuiltInComHost>
    <ApplicationManifest>app.manifest</ApplicationManifest>
    <AvaloniaUseCompiledBindingsByDefault>false</AvaloniaUseCompiledBindingsByDefault>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Avalonia" Version="11.3.9" />
    <PackageReference Include="Avalonia.Desktop" Version="11.3.9" />
    <PackageReference Include="Avalonia.Themes.Fluent" Version="11.3.9" />
    <PackageReference Include="Avalonia.Fonts.Inter" Version="11.3.9" />
    <PackageReference Include="Avalonia.Controls.DataGrid" Version="11.3.9" />
    <PackageReference Include="Npgsql" Version="9.0.0" />
  </ItemGroup>

  <ItemGroup>
    <AvaloniaResource Include="Resources\\**" />
  </ItemGroup>

</Project>
`
};

// Функция создания файла
function createFile(filename, content) {
    const filepath = path.join(process.cwd(), filename);
    
    if (fs.existsSync(filepath)) {
        console.log(`⚠️  Файл уже существует: ${filename}`);
        return false;
    }
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Создан: ${filename}`);
    return true;
}

// Функция создания папок
function createFolders() {
    const folders = ['Resources'];
    folders.forEach(folder => {
        const folderPath = path.join(process.cwd(), folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            console.log(`📁 Создана папка: ${folder}`);
        }
    });
}

// Обработка команд
switch (command) {
    case '1':
        console.log('\n📦 Команда 1: Базовая структура\n');
        createFile('Program.cs', templates['Program.cs']);
        createFile('App.axaml', templates['App.axaml']);
        createFile('App.axaml.cs', templates['App.axaml.cs']);
        createFolders();
        break;

    case '2':
        console.log('\n📦 Команда 2: Модели и подключение к БД\n');
        createFile('Models.cs', templates['Models.cs']);
        createFile('DbConnection.cs', templates['DbConnection.cs']);
        break;

    case '3':
        console.log('\n📦 Команда 3: Окно входа\n');
        createFile('LoginWindow.axaml', templates['LoginWindow.axaml']);
        createFile('LoginWindow.axaml.cs', templates['LoginWindow.axaml.cs']);
        break;

    case '4':
        console.log('\n📦 Команда 4: Главное окно\n');
        createFile('MainWindow.axaml', templates['MainWindow.axaml']);
        createFile('MainWindow.axaml.cs', templates['MainWindow.axaml.cs']);
        break;

    case '5':
        console.log('\n📦 Команда 5: Окно заказов\n');
        createFile('OrdersWindow.axaml', templates['OrdersWindow.axaml']);
        createFile('OrdersWindow.axaml.cs', templates['OrdersWindow.axaml.cs']);
        break;

    case '6':
        console.log('\n📦 Команда 6: Диалог заказа\n');
        createFile('OrderEditDialog.axaml', templates['OrderEditDialog.axaml']);
        createFile('OrderEditDialog.axaml.cs', templates['OrderEditDialog.axaml.cs']);
        break;

    case '7':
        console.log('\n📦 Команда 7: Диалог товара\n');
        createFile('ProductEditDialog.axaml', templates['ProductEditDialog.axaml']);
        createFile('ProductEditDialog.axaml.cs', templates['ProductEditDialog.axaml.cs']);
        break;

    case '8':
        console.log('\n📦 Команда 8: Проектный файл\n');
        createFile('Obuvnaya.csproj', templates['Obuvnaya.csproj']);
        break;

    case '9':
        console.log('\n📦 Команда 9: Полный проект\n');
        createFolders();
        createFile('Program.cs', templates['Program.cs']);
        createFile('App.axaml', templates['App.axaml']);
        createFile('App.axaml.cs', templates['App.axaml.cs']);
        createFile('Models.cs', templates['Models.cs']);
        createFile('DbConnection.cs', templates['DbConnection.cs']);
        createFile('LoginWindow.axaml', templates['LoginWindow.axaml']);
        createFile('LoginWindow.axaml.cs', templates['LoginWindow.axaml.cs']);
        createFile('MainWindow.axaml', templates['MainWindow.axaml']);
        createFile('MainWindow.axaml.cs', templates['MainWindow.axaml.cs']);
        createFile('OrdersWindow.axaml', templates['OrdersWindow.axaml']);
        createFile('OrdersWindow.axaml.cs', templates['OrdersWindow.axaml.cs']);
        createFile('OrderEditDialog.axaml', templates['OrderEditDialog.axaml']);
        createFile('OrderEditDialog.axaml.cs', templates['OrderEditDialog.axaml.cs']);
        createFile('ProductEditDialog.axaml', templates['ProductEditDialog.axaml']);
        createFile('ProductEditDialog.axaml.cs', templates['ProductEditDialog.axaml.cs']);
        createFile('Obuvnaya.csproj', templates['Obuvnaya.csproj']);
        console.log('\n🎉 Полный проект создан!');
        break;

    default:
        console.log(`❌ Неизвестная команда: ${command}`);
        console.log('Используйте: node avalonia-cli.js 0 (для справки)');
        process.exit(1);
}

console.log('');
