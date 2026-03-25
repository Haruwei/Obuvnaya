using Npgsql;
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
            var logEntry = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {message}\n";
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
                SELECT COALESCE(MAX(NULLIF(regexp_replace(receive_code, '\D', '', 'g'), '')::int), 900) + 1
                FROM orders 
                WHERE receive_code ~ '^\d+$'", conn);
            
            var result = cmd.ExecuteScalar();
            return result?.ToString() ?? "901";
        }
        catch
        {
            return "901";
        }
    }
}
