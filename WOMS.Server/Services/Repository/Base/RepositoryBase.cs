// ReSharper disable All
using WOMS.Server.Data;
using WOMS.Server.Interfaces.Repositories.Base;

namespace WOMS.Server.Services.Repository.Base
{
    public abstract class RepositoryBase<T>(WOMSDbContext context) : IRepositoryBase<T> where T : class
    {
        protected WOMSDbContext Context { get; set; } = context;

        public IReadOnlyList<T> Get()
            => [.. Context.Set<T>().AsNoTracking()];

        public async Task<IReadOnlyList<T>?> GetAsync()
            => await Context.Set<T>().AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>?> GetAsync(Expression<Func<T, bool>> predicate)
            => await Context.Set<T>().Where(predicate).AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>?> GetAsync(Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            string? includeString = null,
            bool disabledTrachking = true)
        {
            IQueryable<T> query = Context.Set<T>();

            if (disabledTrachking)
            {
                query = query.AsNoTracking();
            }

            if (!string.IsNullOrWhiteSpace(includeString))
            {
                query = query.Include(includeString);
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return orderBy != null ? await orderBy(query).ToListAsync() : (IReadOnlyList<T>)await query.ToListAsync();
        }

        public async Task<IReadOnlyList<T>?> GetAsync(Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            List<Expression<Func<T, object>>>? includes = null,
            bool disabledTrachking = true)
        {
            IQueryable<T> query = Context.Set<T>();

            if (disabledTrachking)
            {
                query = query.AsNoTracking();
            }

            if (includes != null)
            {
                query = includes.Aggregate(query, (current, include) => current.Include(include));
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return orderBy != null ? await orderBy(query).ToListAsync() : (IReadOnlyList<T>)await query.ToListAsync();
        }

        public virtual async Task<T?> GetByIdAsync(object key)
            => await Context.Set<T>().FindAsync(key);

        public virtual async Task<T?> GetByIdAsync(params object[] keys)
            => await Context.Set<T>().FindAsync(keys);

        public virtual async Task<T?> GetFirstAsync(Expression<Func<T, bool>> predicate)
            => await Context.Set<T>().AsNoTracking().FirstOrDefaultAsync(predicate);

        public async Task<T?> GetFirstAsync(Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disabledTrachking = true)
        {
            IQueryable<T> query = Context.Set<T>();

            if (disabledTrachking)
            {
                query = query.AsNoTracking();
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return orderBy != null ? await orderBy(query).FirstOrDefaultAsync() : await query.FirstOrDefaultAsync();
        }
        
        public async Task<T?> GetLastAsync(Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            bool disabledTrachking = true)
        {
            IQueryable<T> query = Context.Set<T>();

            if (disabledTrachking)
            {
                query = query.AsNoTracking();
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return orderBy != null ? await orderBy(query).LastOrDefaultAsync() : await query.LastOrDefaultAsync();
        }

        public async Task<IReadOnlyList<T>?> GetFromSqlAsync(FormattableString sql)
            => await Context.Set<T>().FromSql(sql).AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>?> GetFromSqlInterpolatedAsync(FormattableString sql)
            => await Context.Set<T>().FromSqlInterpolated(sql).AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>?> GetFromSqlRawAsync(string sql)
            => await Context.Set<T>().FromSqlRaw(sql).AsNoTracking().ToListAsync();

        public void Attach(T entity)
            => Context.Set<T>().Attach(entity);

        public void Create(T entity)
            => _ = Context.Set<T>().Add(entity);

        public void CreateRange(List<T> entities)
            => Context.Set<T>().AddRange(entities);

        public void Update(T entity)
            => Context.Entry(entity).State = EntityState.Modified;

        public void UpdateRange(List<T> entities)
            => entities.ForEach(x => Context.Entry(x).State = EntityState.Modified);

        public async Task<int> UpdateBulk(Expression<Func<T, bool>> predicate, Expression<Func<SetPropertyCalls<T>, SetPropertyCalls<T>>> setPropertyCalls)
            => await Context.Set<T>().Where(predicate).ExecuteUpdateAsync(setPropertyCalls);

        public void Delete(T entity)
            => _ = Context.Set<T>().Remove(entity);

        public IQueryable<T> FindAll
            => Context.Set<T>().AsNoTracking();

        public IQueryable<T> FindByConditions(Expression<Func<T, bool>> conditionExpression)
            => Context.Set<T>().Where(conditionExpression).AsNoTracking();

        public async Task<bool> AnyAsync(Expression<Func<T, bool>> conditionExpression)
            => await Context.Set<T>().AsNoTracking().AnyAsync(conditionExpression);

        public async Task<int> CountAsync() => await Context.Set<T>().AsNoTracking().CountAsync();

        public async Task<int> CountAsync(Expression<Func<T, bool>> conditionExpression)
            => await Context.Set<T>().CountAsync(conditionExpression);
    }
}