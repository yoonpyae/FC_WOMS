namespace WOMS.Server.Interfaces.Repositories.Base
{
    public interface IRepositoryBase<T>
    {
        IQueryable<T> FindAll { get; }
        IQueryable<T> FindByConditions(Expression<Func<T, bool>> conditionExpression);
        IReadOnlyList<T>? Get();
        Task<IReadOnlyList<T>?> GetAsync();
        Task<IReadOnlyList<T>?> GetAsync(Expression<Func<T, bool>> predicate);

        Task<IReadOnlyList<T>?> GetAsync(
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            string? includeString = null,
            bool disabledTrachking = true);

        Task<IReadOnlyList<T>?> GetAsync(
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            List<Expression<Func<T, object>>>? includes = null,
            bool disabledTrachking = true);

        Task<T?> GetByIdAsync(object key);
        Task<T?> GetByIdAsync(params object[] keys);
        Task<T?> GetFirstAsync(Expression<Func<T, bool>> predicate);

        Task<T?> GetFirstAsync(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy,
            bool disabledTrachking = true);

        Task<T?> GetLastAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disabledTrachking = true);

        Task<IReadOnlyList<T>?> GetFromSqlAsync(FormattableString sql);
        Task<IReadOnlyList<T>?> GetFromSqlInterpolatedAsync(FormattableString sql);
        Task<IReadOnlyList<T>?> GetFromSqlRawAsync(string sql);
        void Attach(T entity);
        void Create(T entity);
        void CreateRange(List<T> entities);
        void Update(T entity);
        void UpdateRange(List<T> entities);

        Task<int> UpdateBulk(Expression<Func<T, bool>> predicate,
            Expression<Func<SetPropertyCalls<T>, SetPropertyCalls<T>>> setPropertyCalls);

        void Delete(T entity);
        Task<bool> AnyAsync(Expression<Func<T, bool>> conditionExpression);
        Task<int> CountAsync();
        Task<int> CountAsync(Expression<Func<T, bool>> conditionExpression);
    }
}